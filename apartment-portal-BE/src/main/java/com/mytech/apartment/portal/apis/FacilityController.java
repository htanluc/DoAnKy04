package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.FacilityCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityDto;
import com.mytech.apartment.portal.dtos.FacilityUpdateRequest;
import com.mytech.apartment.portal.services.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FacilityController {
    @Autowired
    private FacilityService facilityService;

    /**
     * Get all facilities (Public - for residents)
     * Lấy danh sách tất cả tiện ích (Công khai - cho cư dân)
     */
    @GetMapping("/facilities")
    public List<FacilityDto> getAllFacilitiesForResident() {
        return facilityService.getAllFacilities();
    }

    /**
     * Get facility by ID (Public - for residents)
     * Lấy tiện ích theo ID (Công khai - cho cư dân)
     */
    @GetMapping("/facilities/{id}")
    public ResponseEntity<FacilityDto> getFacilityByIdForResident(@PathVariable("id") Long id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all facilities (Admin only)
     * Lấy danh sách tất cả tiện ích (Chỉ admin)
     */
    @GetMapping("/admin/facilities")
    public List<FacilityDto> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    /**
     * Get facility by ID (Admin only)
     * Lấy tiện ích theo ID (Chỉ admin)
     */
    @GetMapping("/admin/facilities/{id}")
    public ResponseEntity<FacilityDto> getFacilityById(@PathVariable("id") Long id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new facility (Admin only)
     * Tạo mới tiện ích (Chỉ admin)
     */
    @PostMapping("/admin/facilities")
    public FacilityDto createFacility(@RequestBody FacilityCreateRequest request) {
        return facilityService.createFacility(request);
    }

    /**
     * Update facility by ID (Admin only)
     * Cập nhật tiện ích theo ID (Chỉ admin)
     */
    @PutMapping("/admin/facilities/{id}")
    public ResponseEntity<FacilityDto> updateFacility(@PathVariable("id") Long id, @RequestBody FacilityUpdateRequest request) {
        try {
            FacilityDto updatedFacility = facilityService.updateFacility(id, request);
            return ResponseEntity.ok(updatedFacility);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete facility by ID (Admin only)
     * Xóa tiện ích theo ID (Chỉ admin)
     */
    @DeleteMapping("/admin/facilities/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable("id") Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
} 