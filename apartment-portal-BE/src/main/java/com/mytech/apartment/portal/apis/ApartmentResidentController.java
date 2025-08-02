package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.services.ApartmentResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/admin/apartment-residents")
public class ApartmentResidentController {
    @Autowired
    private ApartmentResidentService apartmentResidentService;

    /**
     * Get all apartment-resident links
     * Lấy danh sách liên kết cư dân - căn hộ
     */
    @GetMapping
    public List<ApartmentResidentDto> getAllApartmentResidents() {
        return apartmentResidentService.getAllApartmentResidents();
    }

    /**
     * Get apartment-resident link by composite ID
     * Lấy liên kết cư dân - căn hộ theo ID kép
     */
    @GetMapping("/{apartmentId}/{userId}")
    public ResponseEntity<ApartmentResidentDto> getApartmentResidentById(@PathVariable("apartmentId") Long apartmentId, @PathVariable("userId") Long userId) {
        return apartmentResidentService.getApartmentResidentById(apartmentId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new apartment-resident link
     * Tạo mới liên kết cư dân - căn hộ
     */
    @PostMapping
    public ApartmentResidentDto addResidentToApartment(@RequestBody ApartmentResidentDto requestDto) {
        return apartmentResidentService.addResidentToApartment(requestDto);
    }

    /**
     * Delete apartment-resident link by composite ID
     * Xóa liên kết cư dân - căn hộ theo ID kép
     */
    @DeleteMapping("/{apartmentId}/{userId}")
    public ResponseEntity<Void> removeResidentFromApartment(@PathVariable("apartmentId") Long apartmentId, @PathVariable("userId") Long userId) {
        try {
            apartmentResidentService.removeResidentFromApartment(apartmentId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Get apartments linked to a user
     * [VI] Lấy danh sách căn hộ đã liên kết với user
     */
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('APARTMENT_RESIDENT_VIEW')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentsByUser(@PathVariable("userId") Long userId) {
        List<ApartmentResidentDto> result = apartmentResidentService.getApartmentResidentsByUserId(userId);
        return ResponseEntity.ok(result);
    }
} 