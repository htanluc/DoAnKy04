package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class BuildingDto {
    private Long id;
    private String buildingName;
    private String address;
    private Integer floors;
    private String description;
} 