package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.Role;
import com.mytech.apartment.portal.services.RoleService;
import com.mytech.apartment.portal.dtos.RoleDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        List<RoleDto> roles = roleService.getAllRoleDtos();
        // Loại bỏ vai trò 'RESIDENT' và 'ADMIN'
        roles = roles.stream()
                .filter(r -> !"RESIDENT".equalsIgnoreCase(r.getName()) && !"ADMIN".equalsIgnoreCase(r.getName()))
                .toList();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleService.createRole(role);
    }

    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleService.updateRole(id, role);
    }

    @DeleteMapping("/{id}")
    public void deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
    }

    @PostMapping("/assign")
    public void assignRoleToUser(@RequestParam Long userId, @RequestParam Long roleId) {
        roleService.assignRoleToUser(userId, roleId);
    }

    @PostMapping("/remove")
    public void removeRoleFromUser(@RequestParam Long userId, @RequestParam Long roleId) {
        roleService.removeRoleFromUser(userId, roleId);
    }

    @GetMapping("/user/{userId}")
    public List<Role> getRolesOfUser(@PathVariable Long userId) {
        return roleService.getRolesOfUser(userId);
    }
} 