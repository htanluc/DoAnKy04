package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ServiceCategoryDto;
import com.mytech.apartment.portal.services.ServiceCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceCategoryController {
    @Autowired
    private ServiceCategoryService serviceCategoryService;

    /**
     * Get all service categories (Public - for residents)
     * Lấy danh sách tất cả loại dịch vụ (Công khai - cho cư dân)
     */
    @GetMapping("/service-categories")
    public List<ServiceCategoryDto> getAllServiceCategoriesForResident() {
        return serviceCategoryService.getAllServiceCategories();
    }

    /**
     * Get service category by ID (Public - for residents)
     * Lấy loại dịch vụ theo ID (Công khai - cho cư dân)
     */
    @GetMapping("/service-categories/{id}")
    public ResponseEntity<ServiceCategoryDto> getServiceCategoryByIdForResident(@PathVariable("id") Long id) {
        return serviceCategoryService.getServiceCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all service categories (Admin only)
     * Lấy danh sách tất cả loại dịch vụ (Chỉ admin)
     */
    @GetMapping("/admin/service-categories")
    public List<ServiceCategoryDto> getAllServiceCategories() {
        return serviceCategoryService.getAllServiceCategories();
    }

    /**
     * Get service category by ID (Admin only)
     * Lấy loại dịch vụ theo ID (Chỉ admin)
     */
    @GetMapping("/admin/service-categories/{id}")
    public ResponseEntity<ServiceCategoryDto> getServiceCategoryById(@PathVariable("id") Long id) {
        return serviceCategoryService.getServiceCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 