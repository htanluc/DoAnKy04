package com.mytech.apartment.portal.dtos;

import java.time.LocalDate;

import com.mytech.apartment.portal.models.enums.RelationType;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentResidentCreateRequest {
    @NotNull(message = "ID căn hộ không được để trống")
    private Long apartmentId;

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotNull(message = "Loại quan hệ không được để trống")
    private RelationType relationType;

    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private Boolean isPrimaryResident = false;
} 