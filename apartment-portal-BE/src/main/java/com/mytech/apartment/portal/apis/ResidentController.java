package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.services.UserService;
import com.mytech.apartment.portal.services.EmailService;
import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Value;
import com.mytech.apartment.portal.models.enums.UserStatus;
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

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

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
        // Chuẩn hóa dữ liệu đầu vào từ Admin:
        // - Nếu thiếu username, dùng phoneNumber làm username
        // - Nếu thiếu mật khẩu, tự sinh mật khẩu ngẫu nhiên và gửi email cho cư dân
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            request.setUsername(request.getPhoneNumber());
        }

        String generatedPassword = null;
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            generatedPassword = generateRandomPassword(12);
            request.setPassword(generatedPassword);
        }

        UserDto created = userService.registerUser(request);

        // Kích hoạt tài khoản ngay khi admin tạo
        try {
            created = userService.setUserStatus(created.getId(), UserStatus.ACTIVE, null);
        } catch (Exception ignored) { }

        // Nếu đã tự sinh mật khẩu và có email, gửi email thông báo
        if (generatedPassword != null && created.getEmail() != null && !created.getEmail().trim().isEmpty()) {
            try {
                String subject = "Tài khoản cư dân của bạn đã được tạo";
                String loginUrl = frontendUrl + "/login";
                String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                    "<h2 style='color:#0d6efd;'>Chào %s,</h2>" +
                    "<p>Tài khoản cư dân của bạn đã được <strong>ban quản trị</strong> tạo trên hệ thống.</p>" +
                    "<div style='background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:12px;margin:12px 0;'>" +
                    "<p style='margin:4px 0'><strong>Tên đăng nhập:</strong> %s</p>" +
                    "<p style='margin:4px 0'><strong>Mật khẩu tạm thời:</strong> %s</p>" +
                    "</div>" +
                    "<p>Vui lòng đăng nhập và đổi mật khẩu ngay tại trang hồ sơ để đảm bảo an toàn.</p>" +
                    "<p><a href='%s' style='display:inline-block;background:#0d6efd;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;'>Đăng nhập ngay</a></p>" +
                    "<p style='color:#6c757d;font-size:12px'>Nếu bạn không yêu cầu tạo tài khoản, vui lòng liên hệ ban quản trị.</p>" +
                    "</div>",
                    created.getFullName() != null ? created.getFullName() : created.getUsername(),
                    created.getUsername(),
                    generatedPassword,
                    loginUrl
                );
                emailService.sendHtmlEmail(created.getEmail(), subject, htmlContent);
            } catch (Exception e) {
                // Không chặn luồng chính nếu gửi email thất bại
            }
        }

        return created;
    }

    private String generateRandomPassword(int length) {
        final String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String lower = "abcdefghijklmnopqrstuvwxyz";
        final String digits = "0123456789";
        final String specials = "!@#$%^&*()-_";
        final String all = upper + lower + digits + specials;
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        // Đảm bảo có đủ đa dạng ký tự
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(specials.charAt(random.nextInt(specials.length())));

        for (int i = sb.length(); i < length; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }
        return sb.toString();
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
