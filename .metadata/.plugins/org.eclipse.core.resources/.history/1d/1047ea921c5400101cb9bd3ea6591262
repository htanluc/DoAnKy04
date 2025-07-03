package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
public class ApartmentResidentLinkRequest {
    
    @NotNull(message = "ID user không được để trống")
    private Long userId;
    
    @NotBlank(message = "Loại quan hệ không được để trống")
    private String relationType; // Chủ sở hữu, Người thuê, Thành viên
    
    private LocalDate moveInDate;
    
    private LocalDate moveOutDate;
} 