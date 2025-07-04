package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ServiceRequestDto;
import com.mytech.apartment.portal.models.ServiceRequest;
import com.mytech.apartment.portal.models.enums.ServiceRequestPriority;
import com.mytech.apartment.portal.models.enums.ServiceRequestStatus;
import org.springframework.stereotype.Component;

@Component
public class ServiceRequestMapper {

    public ServiceRequestDto toDto(ServiceRequest serviceRequest) {
        if (serviceRequest == null) {
            return null;
        }

        return new ServiceRequestDto(
            serviceRequest.getId(),
            serviceRequest.getUser() != null ? serviceRequest.getUser().getId() : null,
            serviceRequest.getUser() != null ? serviceRequest.getUser().getUsername() : null,
            serviceRequest.getCategory() != null ? serviceRequest.getCategory().getCategoryCode() : null,
            serviceRequest.getCategory() != null ? serviceRequest.getCategory().getCategoryName() : null,
            null, // title field doesn't exist in entity
            serviceRequest.getDescription(),
            serviceRequest.getPriority() != null ? serviceRequest.getPriority().name() : null,
            serviceRequest.getStatus() != null ? serviceRequest.getStatus().name() : null,
            serviceRequest.getAssignedTo() != null ? serviceRequest.getAssignedTo().getUsername() : null,
            serviceRequest.getResolutionNotes(),
            serviceRequest.getSubmittedAt(),
            serviceRequest.getAssignedAt(),
            serviceRequest.getCompletedAt()
        );
    }

    public ServiceRequest toEntity(ServiceRequestDto dto) {
        if (dto == null) {
            return null;
        }

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setId(dto.getId());
        serviceRequest.setDescription(dto.getDescription());
        serviceRequest.setPriority(dto.getPriority() != null ? ServiceRequestPriority.valueOf(dto.getPriority()) : null);
        serviceRequest.setStatus(dto.getStatus() != null ? ServiceRequestStatus.valueOf(dto.getStatus()) : null);
        serviceRequest.setResolutionNotes(dto.getResolution());
        serviceRequest.setSubmittedAt(dto.getCreatedAt());
        serviceRequest.setAssignedAt(dto.getUpdatedAt());
        serviceRequest.setCompletedAt(dto.getResolvedAt());
        
        return serviceRequest;
    }
} 