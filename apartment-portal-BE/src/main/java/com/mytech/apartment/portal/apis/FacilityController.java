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
@RequestMapping("/api/admin/facilities")
public class FacilityController {
    @Autowired
    private FacilityService facilityService;

    /**
     * Get all facilities
     * Lấy danh sách tất cả tiện ích
     */
    @GetMapping
    public List<FacilityDto> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    /**
     * Get facility by ID
     * Lấy tiện ích theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FacilityDto> getFacilityById(@PathVariable("id") Long id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new facility
     * Tạo mới tiện ích
     */
    @PostMapping
    public FacilityDto createFacility(@RequestBody FacilityCreateRequest request) {
        return facilityService.createFacility(request);
    }

    /**
     * Update facility by ID
     * Cập nhật tiện ích theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<FacilityDto> updateFacility(@PathVariable("id") Long id, @RequestBody FacilityUpdateRequest request) {
        try {
            FacilityDto updatedFacility = facilityService.updateFacility(id, request);
            return ResponseEntity.ok(updatedFacility);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete facility by ID
     * Xóa tiện ích theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable("id") Long id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 