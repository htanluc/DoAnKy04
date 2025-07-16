package com.mytech.apartment.portal.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCategoryDto {
    private Long id;
    private String categoryCode;
    private String categoryName;
    private String assignedRole;
    private String description;
} 