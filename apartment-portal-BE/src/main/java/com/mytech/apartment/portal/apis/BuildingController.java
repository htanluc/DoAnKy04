package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.BuildingCreateRequest;
import com.mytech.apartment.portal.dtos.BuildingDto;
import com.mytech.apartment.portal.dtos.BuildingUpdateRequest;
import com.mytech.apartment.portal.services.BuildingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {
    @Autowired
    private BuildingService buildingService;

    /**
     * Get all buildings
     * Lấy danh sách tất cả tòa nhà
     */
    @GetMapping
    public List<BuildingDto> getAllBuildings() {
        return buildingService.getAllBuildings();
    }

    /**
     * Get building by ID
     * Lấy thông tin tòa nhà theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BuildingDto> getBuildingById(@PathVariable Long id) {
        return buildingService.getBuildingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new building
     * Tạo mới tòa nhà
     */
    @PostMapping
    public BuildingDto createBuilding(@RequestBody BuildingCreateRequest request) {
        return buildingService.createBuilding(request);
    }

    /**
     * Update building by ID
     * Cập nhật thông tin tòa nhà theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<BuildingDto> updateBuilding(@PathVariable Long id, @RequestBody BuildingUpdateRequest request) {
        try {
            BuildingDto updatedBuilding = buildingService.updateBuilding(id, request);
            return ResponseEntity.ok(updatedBuilding);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete building by ID
     * Xóa tòa nhà theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
} 