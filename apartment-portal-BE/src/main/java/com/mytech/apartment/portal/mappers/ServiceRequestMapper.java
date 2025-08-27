package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ServiceRequestDto;
import com.mytech.apartment.portal.models.ServiceRequest;
import com.mytech.apartment.portal.models.enums.ServiceRequestPriority;
import com.mytech.apartment.portal.models.enums.ServiceRequestStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.ArrayList;

@Component
public class ServiceRequestMapper {

    public ServiceRequestDto toDto(ServiceRequest serviceRequest) {
        if (serviceRequest == null) {
            return null;
        }

        // Parse attachments
        List<String> attachmentUrls = parseJsonToList(serviceRequest.getAttachmentUrls());
        List<String> imageUrls = parseJsonToList(serviceRequest.getImageAttachment());

        return new ServiceRequestDto(
            serviceRequest.getId(),
            serviceRequest.getUser() != null ? serviceRequest.getUser().getId() : null,
            serviceRequest.getUser() != null ? serviceRequest.getUser().getFullName() : null,
            serviceRequest.getUser() != null ? serviceRequest.getUser().getPhoneNumber() : null,
            serviceRequest.getCategory() != null ? serviceRequest.getCategory().getCategoryCode() : null,
            serviceRequest.getCategory() != null ? serviceRequest.getCategory().getCategoryName() : null,
            serviceRequest.getTitle(),
            serviceRequest.getDescription(),
            serviceRequest.getPriority() != null ? serviceRequest.getPriority().getValue() : null,
            serviceRequest.getStatus() != null ? serviceRequest.getStatus().name() : null,
            serviceRequest.getAssignedTo() != null ? serviceRequest.getAssignedTo().getUsername() : null,
            serviceRequest.getAssignedTo() != null ? serviceRequest.getAssignedTo().getId() : null,
            serviceRequest.getAssignedTo() != null ? serviceRequest.getAssignedTo().getPhoneNumber() : null,
            serviceRequest.getResolutionNotes(),
            attachmentUrls,
            imageUrls,
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

    // Helper method to parse JSON string to List
    private List<String> parseJsonToList(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonString, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            // Fallback: try to parse as comma-separated string
            if (jsonString.contains(",")) {
                String[] parts = jsonString.split(",");
                List<String> result = new ArrayList<>();
                for (String part : parts) {
                    String trimmed = part.trim();
                    if (!trimmed.isEmpty()) {
                        result.add(trimmed);
                    }
                }
                return result;
            } else if (!jsonString.trim().isEmpty()) {
                // Single item
                List<String> result = new ArrayList<>();
                result.add(jsonString.trim());
                return result;
            }
            return new ArrayList<>();
        }
    }
} 