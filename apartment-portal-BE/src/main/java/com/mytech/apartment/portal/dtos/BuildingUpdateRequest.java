package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class BuildingUpdateRequest {
    private String buildingName;
    private String address;
    private Integer floors;
    private String description;
} 