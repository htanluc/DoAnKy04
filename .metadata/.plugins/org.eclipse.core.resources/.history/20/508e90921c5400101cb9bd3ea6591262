package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.RoleDto;
import com.mytech.apartment.portal.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    @Autowired
    private RoleService roleService;

    /**
     * Get all roles
     * Lấy tất cả vai trò
     */
    @GetMapping
    public List<RoleDto> getAllRoles() {
        return roleService.getAllRoles();
    }

    /**
     * Get role by id
     * Lấy vai trò theo id
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable("id") Integer id) {
        return roleService.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get role by name
     * Lấy vai trò theo tên
     */
    @GetMapping("/search")
    public ResponseEntity<RoleDto> getRoleByName(@RequestParam String name) {
        return roleService.getRoleByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new role
     * Tạo vai trò mới
     */
    @PostMapping
    public RoleDto createRole(@RequestBody RoleDto roleDto) {
        return roleService.createRole(roleDto);
    }

    /**
     * Update role by id
     * Cập nhật vai trò theo id
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Integer id, @RequestBody RoleDto roleDetails) {
        try {
            RoleDto updated = roleService.updateRole(id, roleDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete role by id
     * Xóa vai trò theo id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
} 