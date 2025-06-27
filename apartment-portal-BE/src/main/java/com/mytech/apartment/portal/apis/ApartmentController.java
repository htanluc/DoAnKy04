package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.ApartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {
    @Autowired
    private ApartmentService apartmentService;

    /**
     * Get all apartments
     * Lấy danh sách tất cả căn hộ
     */
    @GetMapping
    public List<ApartmentDto> getAllApartments() {
        try {
            List<ApartmentDto> apartments = apartmentService.getAllApartments();
            if (apartments == null || apartments.isEmpty()) {
                System.out.println("[WARN] Danh sách apartment trả về rỗng!");
            } else {
                System.out.println("[INFO] Số lượng apartment trả về: " + apartments.size());
            }
            return apartments;
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách apartment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Get apartment by ID
     * Lấy thông tin căn hộ theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApartmentDto> getApartmentById(@PathVariable("id") Long id) {
        return apartmentService.getApartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update apartment by ID
     * Cập nhật thông tin căn hộ theo ID
     * Lưu ý: Không thể thêm/xóa căn hộ sau khi triển khai
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApartmentDto> updateApartment(@PathVariable("id") Long id, @RequestBody ApartmentUpdateRequest request) {
        try {
            ApartmentDto updatedApartment = apartmentService.updateApartment(id, request);
            return ResponseEntity.ok(updatedApartment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Link user to apartment
     * Liên kết tài khoản user với căn hộ
     */
    @PostMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResponse<String>> linkResidentToApartment(
            @PathVariable("apartmentId") Long apartmentId,
            @Valid @RequestBody ApartmentResidentLinkRequest request) {
        try {
            apartmentService.linkResidentToApartment(apartmentId, request);
            return ResponseEntity.ok(ApiResponse.success("Liên kết user với căn hộ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Unlink user from apartment
     * Hủy liên kết tài khoản user với căn hộ
     */
    @DeleteMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResponse<String>> unlinkResidentFromApartment(
            @PathVariable("apartmentId") Long apartmentId,
            @Valid @RequestBody ApartmentResidentUnlinkRequest request) {
        try {
            apartmentService.unlinkResidentFromApartment(apartmentId, request.getUserId());
            return ResponseEntity.ok(ApiResponse.success("Hủy liên kết user với căn hộ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get residents of apartment
     * Lấy danh sách cư dân của căn hộ
     */
    @GetMapping("/{apartmentId}/residents")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentResidents(@PathVariable("apartmentId") Long apartmentId) {
        try {
            List<ApartmentResidentDto> residents = apartmentService.getApartmentResidents(apartmentId);
            return ResponseEntity.ok(residents);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get apartments by building
     * Lấy danh sách căn hộ theo tòa nhà
     */
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<List<ApartmentDto>> getApartmentsByBuilding(@PathVariable("buildingId") Long buildingId) {
        try {
            List<ApartmentDto> apartments = apartmentService.getApartmentsByBuilding(buildingId);
            return ResponseEntity.ok(apartments);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get apartments by status
     * Lấy danh sách căn hộ theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ApartmentDto>> getApartmentsByStatus(@PathVariable("status") String status) {
        try {
            List<ApartmentDto> apartments = apartmentService.getApartmentsByStatus(status);
            return ResponseEntity.ok(apartments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}