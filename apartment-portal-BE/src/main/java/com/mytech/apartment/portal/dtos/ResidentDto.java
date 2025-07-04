package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ResidentDto {
    private Long id;
    private Long userId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String familyRelation;
    private Integer status;
}
