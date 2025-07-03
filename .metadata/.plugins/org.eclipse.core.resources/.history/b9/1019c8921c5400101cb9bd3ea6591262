package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ResidentDto;
import com.mytech.apartment.portal.dtos.ResidentUpdateRequest;
import com.mytech.apartment.portal.services.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/residents")
public class ResidentController {
    @Autowired
    private ResidentService residentService;

    /**
     * [EN] Get all residents
     * [VI] Lấy danh sách tất cả cư dân
     */
    @GetMapping
    public List<ResidentDto> getAllResidents() {
        return residentService.getAllResidents();
    }

    /**
     * [EN] Get resident by ID
     * [VI] Lấy thông tin cư dân theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResidentDto> getResidentById(@PathVariable("id") Long id) {
        return residentService.getResidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * [EN] Create new resident
     * [VI] Tạo cư dân mới
     */
    @PostMapping
    public ResidentDto createResident(@RequestBody ResidentCreateRequest req) {
        return residentService.createResident(req);
    }

    /**
     * [EN] Update resident by ID
     * [VI] Cập nhật thông tin cư dân theo ID
     */
    @PutMapping("/{id}")
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResident(@PathVariable Long id) {
        residentService.deleteResident(id);
        return ResponseEntity.noContent().build();
    }
} 