package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.services.UserService;
import com.mytech.apartment.portal.services.FileUploadService;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private FileUploadService fileUploadService;

    /**
     * [EN] Get all users (Admin only)
     * [VI] Lấy danh sách tất cả tài khoản người dùng (Chỉ admin)
     */
    @GetMapping("/admin/users")
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * [EN] Get user by ID (Admin only)
     * [VI] Lấy thông tin tài khoản người dùng theo ID (Chỉ admin)
     */
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") Long id) {
        UserDto userDto = userService.getUserById(id);
        if (userDto != null) {
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Create new user (Admin only)
     * [VI] Tạo tài khoản người dùng mới (Chỉ admin)
     */
    @PostMapping("/admin/users")
    public UserDto createUser(@RequestBody UserCreateRequest req) {
        return userService.createUser(req);
    }

    /**
     * [EN] Update user by ID (Admin only)
     * [VI] Cập nhật thông tin tài khoản người dùng theo ID (Chỉ admin)
     */
    @PutMapping("/admin/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable("id") Long id, @RequestBody UserUpdateRequest req) {
        try {
            UserDto updatedUser = userService.updateUser(id, req);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Delete user by ID (Admin only)
     * [VI] Xóa tài khoản người dùng theo ID (Chỉ admin)
     */
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [EN] Upload avatar for current user
     * [VI] Upload avatar cho user hiện tại
     */
    @PostMapping("/auth/me/avatar")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            String imageUrl = fileUploadService.uploadAvatarImage(file);
            
            // Cập nhật avatar URL vào database cho user
            boolean success = userService.updateAvatar(username, imageUrl);
            if (success) {
                return ResponseEntity.ok(imageUrl);
            } else {
                return ResponseEntity.badRequest().body("Không thể cập nhật avatar");
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload file: " + e.getMessage());
        }
    }

    /**
     * [EN] Set user status (activate/deactivate)
     * [VI] Đổi trạng thái tài khoản (kích hoạt/vô hiệu hóa)
     */
    @PutMapping("/admin/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> setUserStatus(@PathVariable("id") Long id, @RequestParam("status") String status, @RequestParam(value = "reason", required = false) String reason) {
        try {
            // Log để debug
            System.out.println("setUserStatus called with id: " + id + ", status: " + status + ", reason: " + reason);
            
            UserDto userDto = userService.setUserStatus(id, UserStatus.valueOf(status), reason);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", userDto));
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Trạng thái không hợp lệ: " + status));
        } catch (RuntimeException e) {
            System.err.println("RuntimeException: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không tìm thấy user với ID: " + id));
        } catch (Exception e) {
            System.err.println("Generic Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Đã xảy ra lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * [EN] Reset user password
     * [VI] Đặt lại mật khẩu cho tài khoản người dùng
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<UserDto> resetPassword(@PathVariable("id") Long id, @RequestParam("newPassword") String newPassword) {
        try {
            UserDto userDto = userService.resetPassword(id, newPassword);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/roles")
    public List<Role> getRolesOfUser(@PathVariable("id") Long id) {
        return userService.getRolesOfUser(id);
    }

    /**
     * [EN] Get current user profile
     * [VI] Lấy thông tin profile của user hiện tại
     */
    @GetMapping("/residents/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            UserDto userDto = userService.getUserById(userId);
            if (userDto == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * [EN] Update current user profile
     * [VI] Cập nhật thông tin profile của user hiện tại
     */
    @PutMapping("/residents/me")
    public ResponseEntity<UserDto> updateCurrentUser(@RequestBody UserUpdateRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            UserDto updatedUser = userService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/roles/assign")
    public void assignRoleToUser(@PathVariable("id") Long id, @RequestParam Long roleId) {
        userService.assignRoleToUser(id, roleId);
    }

    @PostMapping("/{id}/roles/remove")
    public void removeRoleFromUser(@PathVariable("id") Long id, @RequestParam Long roleId) {
        userService.removeRoleFromUser(id, roleId);
    }

    /**
     * [EN] Test endpoint to check if API is working
     * [VI] Endpoint test để kiểm tra API có hoạt động không
     */
    @GetMapping("/admin/users/test")
    public ResponseEntity<ApiResponse<String>> testEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("API is working", "Test successful"));
    }
}