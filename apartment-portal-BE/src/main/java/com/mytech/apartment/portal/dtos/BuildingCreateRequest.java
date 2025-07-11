package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class BuildingCreateRequest {
    private String buildingName;
    private String address;
    private Integer floors;
    private String description;
} 