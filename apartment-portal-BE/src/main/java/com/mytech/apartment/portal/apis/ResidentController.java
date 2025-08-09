package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ResidentController - API quản lý cư dân
 * Provides endpoints for managing residents (users with RESIDENT role)
 */
@RestController
@RequestMapping("/api/admin/residents")
@PreAuthorize("hasRole('ADMIN')")
public class ResidentController {

    @Autowired
    private UserService userService;

    /**
     * [EN] Get all residents
     * [VI] Lấy danh sách tất cả cư dân
     */
    @GetMapping
    public List<UserDto> getAllResidents() {
        return userService.getAllResidents();
    }

    /**
     * [EN] Get resident by ID
     * [VI] Lấy thông tin cư dân theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getResidentById(@PathVariable("id") Long id) {
        System.out.println("[DEBUG] Getting resident by ID: " + id);
        
        UserDto resident = userService.getUserById(id);
        System.out.println("[DEBUG] UserService.getUserById result: " + (resident != null ? "Found user: " + resident.getFullName() : "User not found"));
        
        if (resident != null) {
            System.out.println("[DEBUG] User roles: " + resident.getRoles());
            
            // Verify this user has RESIDENT role
            boolean isResident = resident.getRoles().stream()
                .anyMatch(role -> "RESIDENT".equals(role));
            System.out.println("[DEBUG] Has RESIDENT role: " + isResident);
            
            if (isResident) {
                System.out.println("[DEBUG] Returning user successfully");
                return ResponseEntity.ok(resident);
            } else {
                System.out.println("[DEBUG] User exists but doesn't have RESIDENT role");
            }
        }
        
        System.out.println("[DEBUG] Returning 404 Not Found");
        return ResponseEntity.notFound().build();
    }

    /**
     * [EN] Create new resident
     * [VI] Tạo cư dân mới
     */
    @PostMapping
    public UserDto createResident(@RequestBody UserCreateRequest request) {
        // Ensure the user will have RESIDENT role by using registerUser method
        return userService.registerUser(request);
    }

    /**
     * [EN] Update resident by ID
     * [VI] Cập nhật thông tin cư dân theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateResident(@PathVariable("id") Long id, @RequestBody UserUpdateRequest request) {
        try {
            // First check if user exists and has RESIDENT role
            UserDto existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }
            
            boolean isResident = existingUser.getRoles().stream()
                .anyMatch(role -> "RESIDENT".equals(role));
            if (!isResident) {
                return ResponseEntity.notFound().build();
            }

            UserDto updatedResident = userService.updateUser(id, request);
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
    public ResponseEntity<Void> deleteResident(@PathVariable("id") Long id) {
        try {
            // First check if user exists and has RESIDENT role
            UserDto existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }
            
            boolean isResident = existingUser.getRoles().stream()
                .anyMatch(role -> "RESIDENT".equals(role));
            if (!isResident) {
                return ResponseEntity.notFound().build();
            }

            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
