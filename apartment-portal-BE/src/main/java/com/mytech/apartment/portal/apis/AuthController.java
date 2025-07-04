package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.dtos.ChangePasswordRequest;
import com.mytech.apartment.portal.dtos.ForgotPasswordRequest;
import com.mytech.apartment.portal.dtos.JwtResponse;
import com.mytech.apartment.portal.dtos.LoginRequest;
import com.mytech.apartment.portal.dtos.RegisterRequest;
import com.mytech.apartment.portal.dtos.ResetPasswordRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.models.RefreshToken;
import com.mytech.apartment.portal.models.User;

import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.security.UserDetailsImpl;
import com.mytech.apartment.portal.security.jwt.JwtProvider;
import com.mytech.apartment.portal.services.AuthService;
import com.mytech.apartment.portal.services.RefreshTokenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication & registration")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepo;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "Validate token", description = "Validate JWT token and return user info")
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<UserDto>> validateToken() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                UserDto userDto = new UserDto();
                userDto.setId(userDetails.getId());
                userDto.setUsername(userDetails.getUsername());
                userDto.setPhoneNumber(userDetails.getUsername());
                userDto.setStatus("ACTIVE");
                if (userDetails.getRoles() != null) {
                    userDto.setRoles(userDetails.getRoles().stream().map(r -> r.getName()).collect(java.util.stream.Collectors.toSet()));
                } else {
                    userDto.setRoles(new java.util.HashSet<>());
                }
                userDto.setLockReason(null);
                userDto.setCreatedAt(null);
                userDto.setUpdatedAt(null);
                return ResponseEntity.ok(ApiResponse.success("Token hợp lệ", userDto));
            } else {
                return ResponseEntity.status(401).body(ApiResponse.error("Token không hợp lệ hoặc đã hết hạn"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Token không hợp lệ"));
        }
    }

    @Operation(summary = "User login", description = "Authenticate by phoneNumber and return a JWT token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getPhoneNumber(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepo.findByPhoneNumber(ud.getUsername()).orElse(null);

        // Kiểm tra trạng thái tài khoản
        if (user != null && user.getStatus() != null && !UserStatus.ACTIVE.equals(user.getStatus())) {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("status", user.getStatus().name());
            data.put("email", user.getEmail());
            data.put("phoneNumber", user.getPhoneNumber());
            data.put("lockReason", user.getLockReason());
            data.put("roles", new java.util.ArrayList<>());
            // Thông báo phù hợp cho từng trạng thái
            String message;
            UserStatus status = user.getStatus();
            if (UserStatus.LOCKED.equals(status)) {
                message = "Tài khoản đã bị khóa." + (user.getLockReason() != null ? " Lý do: " + user.getLockReason() : "");
            } else if (UserStatus.INACTIVE.equals(status)) {
                // Gửi lại email xác thực nếu user chưa xác thực
                try {
                    authService.resendVerificationEmail(user.getEmail());
                    message = "Tài khoản chưa kích hoạt. Đã gửi lại email xác thực. Vui lòng kiểm tra email.";
                    data.put("canResend", false);
                    data.put("resendMessage", "Vui lòng đợi 10 phút trước khi gửi lại email.");
                } catch (Exception e) {
                    if (e.getMessage().contains("10 phút")) {
                        message = "Tài khoản chưa kích hoạt. " + e.getMessage();
                        data.put("canResend", false);
                        data.put("resendMessage", e.getMessage());
                    } else {
                        message = "Tài khoản chưa kích hoạt. Vui lòng kiểm tra email để xác thực.";
                        data.put("canResend", true);
                        data.put("resendMessage", "Có thể gửi lại email xác thực.");
                    }
                }
            } else {
                message = "Tài khoản không hoạt động.";
            }
            return ResponseEntity.ok(ApiResponse.success(message, data));
        }

        // Đăng nhập thành công
        String token = jwtProvider.generateToken(auth);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        List<String> roles = ud.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .collect(Collectors.toList());

        // Trả về JWT và thông tin user
        Map<String, Object> respData = new java.util.HashMap<>();
        JwtResponse jwtResp = new JwtResponse();
        jwtResp.setToken(token);
        jwtResp.setType("Bearer");
        jwtResp.setId(user != null ? user.getId() : null);
        jwtResp.setUsername(user != null ? user.getUsername() : null);
        jwtResp.setEmail(user != null ? user.getEmail() : null);
        jwtResp.setPhoneNumber(user != null ? user.getPhoneNumber() : null);
        jwtResp.setRoles(roles);
        jwtResp.setStatus(user != null ? user.getStatus().name() : null);
        jwtResp.setRefreshToken(refreshToken.getToken());
        respData.put("jwt", jwtResp);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", respData));
    }

    @Operation(summary = "User registration", description = "Register new user account")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest req) {
        try {
            authService.register(req);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Verify email", description = "Verify email for account activation")
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmailToken(token);
            return ResponseEntity.ok(ApiResponse.success("Kích hoạt tài khoản thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Change password", description = "Change user password (requires authentication)")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        try {
            authService.changePassword(req);
            return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Forgot password", description = "Request password reset")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            authService.forgotPassword(req.getEmailOrPhone());
            return ResponseEntity.ok(ApiResponse.success("Đã gửi hướng dẫn khôi phục mật khẩu!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Reset password", description = "Reset password using token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            authService.resetPassword(req);
            return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Test endpoint", description = "Simple test endpoint")
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth controller is working!");
    }

    @Operation(summary = "Reset admin password", description = "Reset admin user password to admin123")
    @PostMapping("/reset-admin")
    public ResponseEntity<ApiResponse<String>> resetAdminPassword() {
        try {
            // Tìm user admin
            User adminUser = userRepo.findByUsername("admin")
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));

            // Encode password mới
            String newPassword = "admin123";
            String encodedPassword = passwordEncoder.encode(newPassword);

            // Cập nhật password
            adminUser.setPasswordHash(encodedPassword);
            userRepo.save(adminUser);

            return ResponseEntity.ok(ApiResponse.success("Admin password reset successfully", "New password: " + newPassword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to reset admin password: " + e.getMessage()));
        }
    }

    @Operation(summary = "Resend verification email", description = "Resend email verification link for account activation")
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            authService.resendVerificationEmail(req.getEmailOrPhone());
            return ResponseEntity.ok(ApiResponse.success("Đã gửi lại email xác thực!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<?>> refreshToken(@RequestBody Map<String, String> req) {
        String requestRefreshToken = req.get("refreshToken");
        Optional<RefreshToken> tokenOpt = refreshTokenService.findByToken(requestRefreshToken);

        if (tokenOpt.isPresent()) {
            RefreshToken token = tokenOpt.get();
            if (refreshTokenService.isExpired(token)) {
                refreshTokenService.deleteByUser(token.getUser());
                return ResponseEntity.status(403).body(ApiResponse.error("Refresh token đã hết hạn. Vui lòng đăng nhập lại."));
            }
            String newAccessToken = jwtProvider.generateTokenFromUsername(token.getUser().getPhoneNumber());
            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("token", newAccessToken);
            resp.put("refreshToken", token.getToken());
            return ResponseEntity.ok(ApiResponse.success("Cấp mới access token thành công", resp));
        } else {
            return ResponseEntity.status(403).body(ApiResponse.error("Refresh token không hợp lệ."));
        }
    }
}