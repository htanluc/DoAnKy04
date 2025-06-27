package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.Role;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.RoleRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.dtos.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/test-public")
    public ResponseEntity<?> publicAccess() {
        return ResponseEntity.ok("Public content from TestController.");
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> authAccess() {
        return ResponseEntity.ok("Auth content from TestController.");
    }

    @PostMapping("/init-data")
    public ResponseEntity<ApiResponse<String>> initializeData() {
        try {
            // Tạo roles
            createRoles();
            
            // Tạo admin user
            createAdminUser();
            
            return ResponseEntity.ok(ApiResponse.success("Data initialized successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error initializing data: " + e.getMessage()));
        }
    }

    @GetMapping("/check-data")
    public ResponseEntity<ApiResponse<Object>> checkData() {
        try {
            List<Role> roles = roleRepository.findAll();
            List<User> users = userRepository.findAll();
            
            return ResponseEntity.ok(ApiResponse.success("Data check completed", Map.of(
                "roles", roles,
                "users", users
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error checking data: " + e.getMessage()));
        }
    }

    private void createRoles() {
        // Tạo role ADMIN nếu chưa tồn tại
        if (!roleRepository.findByName("ADMIN").isPresent()) {
            Role adminRole = Role.builder()
                    .name("ADMIN")
                    .build();
            roleRepository.save(adminRole);
        }

        // Tạo role RESIDENT nếu chưa tồn tại
        if (!roleRepository.findByName("RESIDENT").isPresent()) {
            Role residentRole = Role.builder()
                    .name("RESIDENT")
                    .build();
            roleRepository.save(residentRole);
        }

        // Tạo role STAFF nếu chưa tồn tại
        if (!roleRepository.findByName("STAFF").isPresent()) {
            Role staffRole = Role.builder()
                    .name("STAFF")
                    .build();
            roleRepository.save(staffRole);
        }
    }

    private void createAdminUser() {
        // Kiểm tra xem user Admin đã tồn tại chưa
        if (!userRepository.findByUsername("admin").isPresent()) {
            // Lấy role ADMIN
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            // Tạo set roles cho admin
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);

            // Tạo user Admin
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@apartment.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .phoneNumber("admin")
                    .status("ACTIVE")
                    .roles(adminRoles)
                    .build();

            userRepository.save(adminUser);
        }
    }
} 