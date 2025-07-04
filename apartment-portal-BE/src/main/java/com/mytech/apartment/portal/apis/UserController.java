package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.services.UserService;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; 
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * [EN] Get all users
     * [VI] Lấy danh sách tất cả tài khoản người dùng
     */
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * [EN] Get user by ID
     * [VI] Lấy thông tin tài khoản người dùng theo ID
     */
    // Lý do .map bị lỗi: Phương thức userService.getUserById(id) trả về UserDto (hoặc null) thay vì Optional<UserDto>,
    // nên không thể gọi .map trên một đối tượng không phải Optional.
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") Long id) {
        UserDto userDto = userService.getUserById(id);
        if (userDto != null) {
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Create new user
     * [VI] Tạo tài khoản người dùng mới
     */
    @PostMapping
    public UserDto createUser(@RequestBody UserCreateRequest req) {
        return userService.createUser(req);
    }

    /**
     * [EN] Update user by ID
     * [VI] Cập nhật thông tin tài khoản người dùng theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable("id") Long id, @RequestBody UserUpdateRequest req) {
        try {
            UserDto updatedUser = userService.updateUser(id, req);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [EN] Delete user by ID
     * [VI] Xóa tài khoản người dùng theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [EN] Set user status (activate/deactivate)
     * [VI] Đổi trạng thái tài khoản (kích hoạt/vô hiệu hóa)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> setUserStatus(@PathVariable("id") Long id, @RequestParam("status") String status, @RequestParam(value = "reason", required = false) String reason) {
        try {
            UserDto userDto = userService.setUserStatus(id, UserStatus.valueOf(status), reason);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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

    @PostMapping("/{id}/roles/assign")
    public void assignRoleToUser(@PathVariable("id") Long id, @RequestParam Long roleId) {
        userService.assignRoleToUser(id, roleId);
    }

    @PostMapping("/{id}/roles/remove")
    public void removeRoleFromUser(@PathVariable("id") Long id, @RequestParam Long roleId) {
        userService.removeRoleFromUser(id, roleId);
    }
}