package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ResidentDto;
import com.mytech.apartment.portal.dtos.ResidentUpdateRequest;
import com.mytech.apartment.portal.services.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.dao.DataIntegrityViolationException;
import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.ResidentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.ApartmentRepository;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Resident Self", description = "API for resident to view/update their own profile")
public class ResidentController {
    @Autowired private UserRepository userRepository;
    @Autowired private ResidentRepository residentRepository;
    @Autowired private ApartmentResidentRepository apartmentResidentRepository;
    @Autowired private ApartmentRepository apartmentRepository;
    @Autowired private ResidentService residentService;

    /**
     * [EN] Get all residents
     * [VI] Lấy danh sách tất cả cư dân
     */
    @GetMapping("/admin/residents")
    public List<ResidentDto> getAllResidents() {
        return residentService.getAllResidents();
    }

    /**
     * [EN] Get resident by ID
     * [VI] Lấy thông tin cư dân theo ID
     */
    @GetMapping("/admin/residents/{id}")
    public ResponseEntity<ResidentDto> getResidentById(@PathVariable("id") Long id) {
        return residentService.getResidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * [EN] Create new resident
     * [VI] Tạo cư dân mới
     */
    @PostMapping("/admin/residents")
    public ResponseEntity<?> createResident(@RequestBody ResidentCreateRequest req) {
        try {
            ResidentDto dto = residentService.createResident(req);
            return ResponseEntity.ok(dto);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SỐ CCCD ĐÃ ĐƯỢC ĐĂNG KÝ."));
        }
    }

    /**
     * [EN] Update resident by ID
     * [VI] Cập nhật thông tin cư dân theo ID
     */
    @PutMapping("/admin/residents/{id}")
    public ResponseEntity<ResidentDto> updateResident(@PathVariable("id") Long id, @RequestBody ResidentUpdateRequest req) {
        try {
            ResidentDto updatedResident = residentService.updateResident(id, req);
            return ResponseEntity.ok(updatedResident);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Delete resident by ID
     * [VI] Xóa cư dân theo ID
     */
    @DeleteMapping("/admin/residents/{id}")
    public ResponseEntity<Void> deleteResident(@PathVariable Long id) {
        residentService.deleteResident(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [EN] Get current resident's own info
     * [VI] Lấy thông tin cá nhân của resident hiện tại
     */
    @Operation(summary = "Get current resident info", description = "Get info of the currently authenticated resident")
    @GetMapping("/residents/me")
    public ResponseEntity<?> getCurrentResident() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = auth.getName();
        // Lấy user
        var userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body("User not found");
        var user = userOpt.get();
        // Lấy resident
        var residentOpt = residentRepository.findByUserId(user.getId());
        if (residentOpt == null) return ResponseEntity.status(401).body("Resident not found");
        var resident = residentOpt;
        // Lấy apartmentResident (liên kết user với apartment)
        var apartmentResidentOpt = apartmentResidentRepository.findByIdResidentId(user.getId()); // Sửa từ findByIdUserId thành findByIdResidentId
        var apartmentResident = apartmentResidentOpt.isEmpty() ? null : apartmentResidentOpt.get(0);
        // Lấy apartment
        var apartment = (apartmentResident != null) ? apartmentRepository.findById(apartmentResident.getId().getApartmentId()).orElse(null) : null;
        // Trả về object đủ cho FE
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("user", user);
            put("resident", resident);
            put("apartment", apartment);
            put("apartmentResident", apartmentResident);
        }});
    }

    /**
     * [EN] Update current resident's own info
     * [VI] Cập nhật thông tin cá nhân resident hiện tại
     */
    @Operation(summary = "Update current resident info", description = "Update info of the currently authenticated resident")
    @PutMapping("/residents/me")
    public ResponseEntity<ResidentDto> updateCurrentResident(@RequestBody ResidentUpdateRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = auth.getName();
        ResidentDto updated = residentService.updateResidentByPhoneNumber(phoneNumber, req);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.ok(new ResidentDto());
    }
} 