package com.mytech.apartment.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.apartment.portal.dtos.ApartmentResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.services.ApartmentResidentService;

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
    public ResponseEntity<List<ApartmentResidentDto>> getAllApartmentResidents() {
        try {
            List<ApartmentResidentDto> residents = apartmentResidentService.getAllApartmentResidents();
            return ResponseEntity.ok(residents);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách apartment residents: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Lấy danh sách RelationType
    @GetMapping("/relation-types")
    public ResponseEntity<List<RelationType>> getRelationTypes() {
        return ResponseEntity.ok(List.of(RelationType.values()));
    }

    // Tạo mối quan hệ mới
    @PostMapping
    public ResponseEntity<ApartmentResidentDto> createApartmentResident(@RequestBody ApartmentResidentCreateRequest request) {
        ApartmentResidentDto created = apartmentResidentService.createApartmentResident(request);
        return ResponseEntity.ok(created);
    }

    // Lấy tất cả cư dân của một căn hộ
    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<ApartmentResidentDto>> getResidentsByApartment(@PathVariable Long apartmentId) {
        List<ApartmentResidentDto> residents = apartmentResidentService.getResidentsByApartment(apartmentId);
        return ResponseEntity.ok(residents);
    }

    // Lấy tất cả căn hộ của một user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentsByUser(@PathVariable Long userId) {
        List<ApartmentResidentDto> apartments = apartmentResidentService.getApartmentsByUser(userId);
        return ResponseEntity.ok(apartments);
    }

    // Lấy căn hộ theo loại quan hệ
    @GetMapping("/user/{userId}/relation-type")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentsByUserAndRelationType(
            @PathVariable Long userId,
            @RequestParam RelationType relationType) {
        List<ApartmentResidentDto> apartments = apartmentResidentService.getApartmentsByUserAndRelationType(userId, relationType);
        return ResponseEntity.ok(apartments);
    }

    // Lấy chủ sở hữu của căn hộ
    @GetMapping("/apartment/{apartmentId}/owners")
    public ResponseEntity<List<ApartmentResidentDto>> getOwnersByApartment(@PathVariable Long apartmentId) {
        List<ApartmentResidentDto> owners = apartmentResidentService.getOwnersByApartment(apartmentId);
        return ResponseEntity.ok(owners);
    }

    // Lấy cư dân chính của căn hộ
    @GetMapping("/apartment/{apartmentId}/primary")
    public ResponseEntity<ApartmentResidentDto> getPrimaryResidentByApartment(@PathVariable Long apartmentId) {
        return apartmentResidentService.getPrimaryResidentByApartment(apartmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Kiểm tra user có quyền với apartment không
    @GetMapping("/check-access")
    public ResponseEntity<Boolean> checkAccessToApartment(
            @RequestParam Long userId,
            @RequestParam Long apartmentId) {
        boolean hasAccess = apartmentResidentService.hasAccessToApartment(userId, apartmentId);
        return ResponseEntity.ok(hasAccess);
    }

    // Cập nhật mối quan hệ
    @PutMapping("/apartment/{apartmentId}/user/{userId}")
    public ResponseEntity<ApartmentResidentDto> updateApartmentResident(
            @PathVariable Long apartmentId,
            @PathVariable Long userId,
            @RequestBody ApartmentResidentCreateRequest request) {
        ApartmentResidentDto updated = apartmentResidentService.updateApartmentResident(apartmentId, userId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * [EN] Get apartments linked to a user
     * [VI] Lấy danh sách căn hộ đã liên kết với user
     */
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('APARTMENT_RESIDENT_VIEW')")
    @GetMapping("/user/{userId}/admin")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentsByUserAdmin(@PathVariable("userId") Long userId) {
        System.out.println("[DEBUG] Getting apartments for user ID: " + userId);
        
        try {
            List<ApartmentResidentDto> result = apartmentResidentService.getApartmentResidentsByUserId(userId);
            System.out.println("[DEBUG] Found " + (result != null ? result.size() : 0) + " apartment relations for user " + userId);
            
            if (result != null && !result.isEmpty()) {
                result.forEach(relation -> {
                    System.out.println("[DEBUG] Relation: Apartment " + relation.getApartmentId() + 
                                     ", User " + relation.getUserId() + 
                                     ", Type: " + relation.getRelationType() +
                                     ", Building: " + relation.getBuildingName() +
                                     ", Unit: " + relation.getUnitNumber());
                });
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("[ERROR] Exception getting apartments for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Xóa mối quan hệ
    @DeleteMapping("/apartment/{apartmentId}/user/{userId}")
    public ResponseEntity<Void> deleteApartmentResident(
            @PathVariable Long apartmentId,
            @PathVariable Long userId) {
        apartmentResidentService.deleteApartmentResident(apartmentId, userId);
        return ResponseEntity.ok().build();
    }

    // Đếm số cư dân của căn hộ
    @GetMapping("/apartment/{apartmentId}/count")
    public ResponseEntity<Long> countResidentsByApartment(@PathVariable Long apartmentId) {
        long count = apartmentResidentService.countResidentsByApartment(apartmentId);
        return ResponseEntity.ok(count);
    }

    // Đếm số căn hộ của user
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countApartmentsByUser(@PathVariable Long userId) {
        long count = apartmentResidentService.countApartmentsByUser(userId);
        return ResponseEntity.ok(count);
    }
} 