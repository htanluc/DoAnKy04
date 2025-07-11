package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.services.ApartmentResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-residents")
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
    @GetMapping("/{apartmentId}/{residentId}")
    public ResponseEntity<ApartmentResidentDto> getApartmentResidentById(@PathVariable("apartmentId") Long apartmentId, @PathVariable("residentId") Long residentId) {
        return apartmentResidentService.getApartmentResidentById(apartmentId, residentId)
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
    @DeleteMapping("/{apartmentId}/{residentId}")
    public ResponseEntity<Void> removeResidentFromApartment(@PathVariable("apartmentId") Long apartmentId, @PathVariable("residentId") Long residentId) {
        try {
            apartmentResidentService.removeResidentFromApartment(apartmentId, residentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 