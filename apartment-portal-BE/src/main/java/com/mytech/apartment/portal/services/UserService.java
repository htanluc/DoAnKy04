package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.mappers.UserMapper;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.Role;
import com.mytech.apartment.portal.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id).map(userMapper::toDto).orElse(null)  ;
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public UserDto createUser(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        if (userCreateRequest.getRoles() != null && !userCreateRequest.getRoles().isEmpty()) {
            HashSet<Role> roles = new HashSet<>();
            for (String roleName : userCreateRequest.getRoles()) {
                Role role = roleRepository.findByName(roleName);
                if (role != null) roles.add(role);
            }
            user.setRoles(roles);
        }
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        userMapper.updateUserFromRequest(user, userUpdateRequest);

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * [EN] Update avatar URL for user
     * [VI] Cập nhật URL avatar cho user
     */
    public boolean updateAvatar(String username, String avatarUrl) {
        try {
            Optional<User> userOpt = userRepository.findByPhoneNumber(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public UserDto setUserStatus(Long id, UserStatus status, String reason) {
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id " + id));
            user.setStatus(status);
            if ("LOCKED".equalsIgnoreCase(status.toString()) || "INACTIVE".equalsIgnoreCase(status.toString())) {
                user.setLockReason(reason);
            } else if ("ACTIVE".equalsIgnoreCase(status.toString())) {
                user.setLockReason(null);
            }
            User savedUser = userRepository.save(user);
            
            // Gửi email thông báo khi vô hiệu hóa tài khoản
            if (status == UserStatus.INACTIVE && reason != null && !reason.trim().isEmpty()) {
                try {
                    sendDeactivationEmail(user, reason);
                    logger.info("Đã gửi email thông báo vô hiệu hóa tài khoản cho user: {}", user.getEmail());
                } catch (Exception emailError) {
                    logger.error("Không thể gửi email thông báo vô hiệu hóa tài khoản cho user {}: {}", user.getEmail(), emailError.getMessage());
                    // Không chặn luồng chính nếu gửi email thất bại
                }
            }
            
            return userMapper.toDto(savedUser);
        } catch (Exception e) {
            // Log error để debug
            logger.error("Error in setUserStatus: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * [EN] Send deactivation notification email to user
     * [VI] Gửi email thông báo vô hiệu hóa tài khoản cho user
     */
    private void sendDeactivationEmail(User user, String reason) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            logger.warn("Không thể gửi email thông báo vô hiệu hóa tài khoản: user {} không có email", user.getUsername());
            return;
        }

        String subject = "Thông báo vô hiệu hóa tài khoản - Hệ thống quản lý tòa nhà";
        String htmlContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
            "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;'>" +
            "<h2 style='color: #dc3545; margin-top: 0;'>⚠️ Thông báo vô hiệu hóa tài khoản</h2>" +
            "<p>Chào <strong>%s</strong>,</p>" +
            "<p>Tài khoản của bạn trong hệ thống quản lý tòa nhà đã bị <strong>vô hiệu hóa</strong>.</p>" +
            "<div style='background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6; margin: 15px 0;'>" +
            "<h3 style='margin-top: 0; color: #495057;'>Thông tin tài khoản:</h3>" +
            "<ul style='margin: 10px 0; padding-left: 20px;'>" +
            "<li><strong>Tên đăng nhập:</strong> %s</li>" +
            "<li><strong>Email:</strong> %s</li>" +
            "<li><strong>Trạng thái:</strong> <span style='color: #dc3545; font-weight: bold;'>Đã vô hiệu hóa</span></li>" +
            "</ul>" +
            "</div>" +
            "<div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 15px 0;'>" +
            "<h3 style='margin-top: 0; color: #856404;'>Lý do vô hiệu hóa:</h3>" +
            "<p style='margin: 0; color: #856404;'><em>%s</em></p>" +
            "</div>" +
            "<div style='background-color: #d1ecf1; padding: 15px; border-radius: 5px; border: 1px solid #bee5eb; margin: 15px 0;'>" +
            "<h3 style='margin-top: 0; color: #0c5460;'>Hướng dẫn khôi phục:</h3>" +
            "<p style='margin: 0; color: #0c5460;'>Để khôi phục tài khoản, vui lòng:</p>" +
            "<ol style='margin: 10px 0; padding-left: 20px; color: #0c5460;'>" +
            "<li>Liên hệ trực tiếp với ban quản lý tòa nhà</li>" +
            "<li>Hoặc gửi email yêu cầu khôi phục đến: <strong>admin@building.com</strong></li>" +
            "<li>Nêu rõ lý do và cam kết tuân thủ quy định</li>" +
            "</ol>" +
            "</div>" +
            "<p style='color: #6c757d; font-size: 14px; margin-top: 20px;'>" +
            "Email này được gửi tự động từ hệ thống quản lý tòa nhà.<br>" +
            "Vui lòng không trả lời email này." +
            "</p>" +
            "</div>" +
            "</div>",
            user.getFullName() != null ? user.getFullName() : user.getUsername(),
            user.getUsername(),
            user.getEmail(),
            reason
        );

        try {
            emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
            logger.info("Đã gửi email thông báo vô hiệu hóa tài khoản thành công cho user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email thông báo vô hiệu hóa tài khoản cho user {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Không thể gửi email thông báo: " + e.getMessage());
        }
    }

    public UserDto resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id " + id));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return userMapper.toDto(userRepository.save(user));
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(User::getId)
            .orElse(null);
    }

    public List<Role> getRolesOfUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return List.copyOf(user.getRoles());
    }

    public void assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().add(role);
        userRepository.save(user);
    }

    public void removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public UserDto registerUser(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        Role residentRole = roleRepository.findByName("RESIDENT");
        if (residentRole == null) {
            residentRole = roleRepository.save(new Role(null, "RESIDENT", "Cư dân"));
        }
        roles.add(residentRole);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public User registerUserReturnEntity(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        Role residentRole = roleRepository.findByName("RESIDENT");
        if (residentRole == null) {
            residentRole = roleRepository.save(new Role(null, "RESIDENT", "Cư dân"));
        }
        roles.add(residentRole);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public Long getUserIdByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .map(User::getId)
            .orElse(null);
    }

    /**
     * [EN] Get all residents (users with RESIDENT role)
     * [VI] Lấy tất cả cư dân (users có role RESIDENT)
     */
    public List<UserDto> getAllResidents() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "RESIDENT".equals(role.getName())))
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
}
