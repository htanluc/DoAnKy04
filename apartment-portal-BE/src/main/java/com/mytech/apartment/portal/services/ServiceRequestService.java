package com.mytech.apartment.portal.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.apartment.portal.dtos.ServiceRequestAssignmentRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestCreateRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestDto;
import com.mytech.apartment.portal.dtos.ServiceRequestStatusUpdateRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestUpdateRequest;
import com.mytech.apartment.portal.mappers.ServiceRequestMapper;
import com.mytech.apartment.portal.models.ServiceCategory;
import com.mytech.apartment.portal.models.ServiceRequest;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.ServiceRequestRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.models.enums.ServiceRequestStatus;
import com.mytech.apartment.portal.models.enums.ServiceRequestPriority;

import jakarta.transaction.Transactional;

@Service
public class ServiceRequestService {
    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRequestMapper serviceRequestMapper;

    public List<ServiceRequestDto> getAllServiceRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(serviceRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ServiceRequestDto> getServiceRequestById(Long id) {
        return serviceRequestRepository.findById(id).map(serviceRequestMapper::toDto);
    }

    public ServiceRequestDto createServiceRequest(ServiceRequestCreateRequest request) {
        User user = userRepository.findById(request.getResidentId())
                .orElseThrow(() -> new RuntimeException("User not found with id " + request.getResidentId()));

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setUser(user);
        serviceRequest.setDescription(request.getDescription());
        serviceRequest.setPriority(request.getPriority() != null ? ServiceRequestPriority.valueOf(request.getPriority().toString()) : null);
        serviceRequest.setPriority(request.getPriority() != null ? ServiceRequestPriority.valueOf(request.getPriority()) : null);
        serviceRequest.setStatus(ServiceRequestStatus.OPEN);
        serviceRequest.setSubmittedAt(LocalDateTime.now());

        ServiceRequest savedServiceRequest = serviceRequestRepository.save(serviceRequest);
        return serviceRequestMapper.toDto(savedServiceRequest);
    }

    public ServiceRequestDto updateServiceRequest(Long id, ServiceRequestUpdateRequest request) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found with id " + id));

        if (request.getStatus() != null) {
            serviceRequest.setStatus(ServiceRequestStatus.valueOf(request.getStatus()));
        }
        if (request.getAssignedTo() != null) {
            // For now, we'll assume assignedTo is a user ID
            try {
                Long userId = Long.parseLong(request.getAssignedTo());
                User assignedUser = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with id " + userId));
                serviceRequest.setAssignedTo(assignedUser);
                serviceRequest.setAssignedAt(LocalDateTime.now());
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid user ID format: " + request.getAssignedTo());
            }
        }
        if (request.getResolution() != null) {
            serviceRequest.setResolutionNotes(request.getResolution());
            if ("COMPLETED".equals(request.getStatus())) {
                serviceRequest.setCompletedAt(LocalDateTime.now());
            }
        }

        ServiceRequest updatedServiceRequest = serviceRequestRepository.save(serviceRequest);
        return serviceRequestMapper.toDto(updatedServiceRequest);
    }

    public void deleteServiceRequest(Long id) {
        if (!serviceRequestRepository.existsById(id)) {
            throw new RuntimeException("Service request not found with id " + id);
        }
        serviceRequestRepository.deleteById(id);
    }

    @Transactional
    public void assignServiceRequest(Long requestId, ServiceRequestAssignmentRequest request) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found with id " + requestId));

        // Kiểm tra nhân viên tồn tại
        User assignedUser = userRepository.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new RuntimeException("Staff not found with id " + request.getAssignedToUserId()));

        // Cập nhật thông tin gán
        serviceRequest.setAssignedTo(assignedUser);
        serviceRequest.setAssignedAt(LocalDateTime.now());
        serviceRequest.setPriority(request.getPriority() != null ? ServiceRequestPriority.valueOf(request.getPriority().toString()) : null);
        serviceRequest.setStatus(ServiceRequestStatus.IN_PROGRESS);

        // Cập nhật loại dịch vụ nếu cần
        // if (request.getServiceCategory() != null) {
        //     // Tìm category theo tên
        //     // ServiceCategory category = ServiceCategory.fromString(request.getServiceCategory())
        //     //         .orElseThrow(() -> new RuntimeException("Service category not found: " + request.getServiceCategory()));
        //     // serviceRequest.setCategory(category);
        // }

        // Lưu ghi chú admin
        if (request.getAdminNotes() != null) {
            serviceRequest.setResolutionNotes(request.getAdminNotes());
        }

        serviceRequestRepository.save(serviceRequest);
    }

    public List<ServiceRequestDto> getServiceRequestsByRole(String role) {
        return serviceRequestRepository.findByCategoryAssignedRole(role).stream()
                .map(serviceRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestDto> getAssignedServiceRequests(Long staffId) {
        return serviceRequestRepository.findByAssignedToId(staffId).stream()
                .map(serviceRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateServiceRequestStatus(Long requestId, ServiceRequestStatusUpdateRequest request) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found with id " + requestId));

        // Cập nhật trạng thái
        serviceRequest.setStatus(ServiceRequestStatus.valueOf(request.getStatus()));

        // Cập nhật ghi chú xử lý
        if (request.getResolutionNotes() != null) {
            serviceRequest.setResolutionNotes(request.getResolutionNotes());
        }

        // Cập nhật đánh giá nếu có
        if (request.getRating() != null) {
            serviceRequest.setRating(request.getRating());
        }

        // Cập nhật thời gian hoàn thành nếu hoàn thành
        if (request.getIsCompleted() && "COMPLETED".equals(request.getStatus())) {
            serviceRequest.setCompletedAt(LocalDateTime.now());
        }

        serviceRequestRepository.save(serviceRequest);
    }

    public List<ServiceRequestDto> getServiceRequestsByStatus(String status) {
        return serviceRequestRepository.findByStatus(ServiceRequestStatus.valueOf(status)).stream()
                .map(serviceRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestDto> getServiceRequestsByCategory(String category) {
        return serviceRequestRepository.findByCategoryCategoryName(category).stream()
                .map(serviceRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestDto> getServiceRequestsByUserId(Long userId) {
        return serviceRequestRepository.findByUserId(userId).stream()
            .map(serviceRequestMapper::toDto)
            .collect(Collectors.toList());
    }
} 