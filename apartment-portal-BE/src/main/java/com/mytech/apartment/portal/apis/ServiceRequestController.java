package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ServiceRequestCreateRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestDto;
import com.mytech.apartment.portal.dtos.ServiceRequestUpdateRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestAssignmentRequest;
import com.mytech.apartment.portal.dtos.ServiceRequestStatusUpdateRequest;
import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.services.ServiceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.mytech.apartment.portal.services.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@Tag(name = "Resident Support Request", description = "API for resident to view their own support requests")
public class ServiceRequestController {
    @Autowired
    private ServiceRequestService serviceRequestService;
    @Autowired
    private UserService userService;

    /**
     * Get all support requests
     * Lấy danh sách tất cả yêu cầu hỗ trợ
     */
    @GetMapping("/admin/support-requests")
    public List<ServiceRequestDto> getAllServiceRequests() {
        return serviceRequestService.getAllServiceRequests();
    }

    /**
     * Get support request by ID
     * Lấy yêu cầu hỗ trợ theo ID
     */
    @GetMapping("/admin/support-requests/{id}")
    public ResponseEntity<ServiceRequestDto> getServiceRequestById(@PathVariable Long id) {
        Optional<ServiceRequestDto> serviceRequest = serviceRequestService.getServiceRequestById(id);
        return serviceRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new support request
     * Tạo mới yêu cầu hỗ trợ
     */
    @PostMapping("/support-requests")
    public ResponseEntity<ServiceRequestDto> createServiceRequest(@RequestBody ServiceRequestCreateRequest request) {
        try {
            ServiceRequestDto serviceRequest = serviceRequestService.createServiceRequest(request);
            return ResponseEntity.ok(serviceRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Update support request by ID
     * Cập nhật yêu cầu hỗ trợ theo ID
     */
    @PutMapping("/admin/support-requests/{id}")
    public ResponseEntity<ServiceRequestDto> updateServiceRequest(@PathVariable Long id, @RequestBody ServiceRequestUpdateRequest request) {
        try {
            ServiceRequestDto updatedServiceRequest = serviceRequestService.updateServiceRequest(id, request);
            return ResponseEntity.ok(updatedServiceRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete support request by ID
     * Xóa yêu cầu hỗ trợ theo ID
     */
    @DeleteMapping("/admin/support-requests/{id}")
    public ResponseEntity<Void> deleteServiceRequest(@PathVariable Long id) {
        try {
            serviceRequestService.deleteServiceRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Assign service request to staff
     * Phân loại và gán yêu cầu hỗ trợ cho nhân viên
     */
    @PostMapping("/admin/support-requests/{id}/assign")
    public ResponseEntity<ApiResponse<String>> assignServiceRequest(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequestAssignmentRequest request) {
        try {
            serviceRequestService.assignServiceRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Gán yêu cầu hỗ trợ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get service requests by staff role
     * Lấy yêu cầu hỗ trợ theo vai trò nhân viên
     */
    @GetMapping("/staff/support-requests")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByRole(
            @RequestParam String role) {
        try {
            List<ServiceRequestDto> requests = serviceRequestService.getServiceRequestsByRole(role);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get service requests assigned to specific staff
     * Lấy yêu cầu hỗ trợ được gán cho nhân viên cụ thể
     */
    @GetMapping("/staff/support-requests/assigned")
    public ResponseEntity<List<ServiceRequestDto>> getAssignedServiceRequests(
            @RequestParam Long staffId) {
        try {
            List<ServiceRequestDto> requests = serviceRequestService.getAssignedServiceRequests(staffId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update service request status (for staff)
     * Cập nhật trạng thái yêu cầu hỗ trợ (cho nhân viên)
     */
    @PutMapping("/staff/support-requests/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateServiceRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequestStatusUpdateRequest request) {
        try {
            serviceRequestService.updateServiceRequestStatus(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get service requests by status
     * Lấy yêu cầu hỗ trợ theo trạng thái
     */
    @GetMapping("/admin/support-requests/status/{status}")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByStatus(
            @PathVariable String status) {
        try {
            List<ServiceRequestDto> requests = serviceRequestService.getServiceRequestsByStatus(status);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get service requests by category
     * Lấy yêu cầu hỗ trợ theo loại dịch vụ
     */
    @GetMapping("/admin/support-requests/category/{category}")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByCategory(
            @PathVariable String category) {
        try {
            List<ServiceRequestDto> requests = serviceRequestService.getServiceRequestsByCategory(category);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * [EN] Get support requests of current resident
     * [VI] Lấy lịch sử yêu cầu hỗ trợ của resident hiện tại
     */
    @Operation(summary = "Get support requests of current resident", description = "Get list of support requests for the currently authenticated resident")
    @GetMapping("/support-requests/my")
    public ResponseEntity<List<ServiceRequestDto>> getMySupportRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Long userId = null;
        try {
            userId = userService.getUserIdByUsername(username);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (userId == null) return ResponseEntity.status(401).build();
        List<ServiceRequestDto> requests = serviceRequestService.getServiceRequestsByUserId(userId);
        return ResponseEntity.ok(requests);
    }
} 