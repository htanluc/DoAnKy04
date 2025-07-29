// com/mytech/apartment/portal/dtos/ServiceRequestAssignmentRequest.java
package com.mytech.apartment.portal.dtos;

import com.mytech.apartment.portal.models.enums.ServiceCategoryType;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceRequestAssignmentRequest {

    @NotNull(message = "ID nhân viên được gán không được để trống")
    private Long assignedToUserId;
    
    private String priority;
    
    private String adminNotes;

}
