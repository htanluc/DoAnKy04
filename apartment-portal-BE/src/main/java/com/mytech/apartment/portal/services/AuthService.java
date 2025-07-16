package com.mytech.apartment.portal.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.EmailVerificationToken;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.EmailVerificationTokenRepository;
import com.mytech.apartment.portal.models.Resident;
import com.mytech.apartment.portal.repositories.ResidentRepository;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.dtos.UserCreateRequest;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private UserService userService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public void register(RegisterRequest request, String origin) {
        // Kiểm tra mật khẩu xác nhận
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        
        // Kiểm tra email đã tồn tại
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Kiểm tra số điện thoại đã tồn tại
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã được đăng ký");
        }
        
        // Tạo user mới với trạng thái INACTIVE và role RESIDENT mặc định
        UserCreateRequest userCreateRequest = new UserCreateRequest();
        userCreateRequest.setUsername(request.getPhoneNumber());
        userCreateRequest.setPhoneNumber(request.getPhoneNumber());
        userCreateRequest.setPassword(request.getPassword());
        userCreateRequest.setEmail(request.getEmail());
        // Không set roles để UserService.registerUser tự gán role RESIDENT
        User user = userService.registerUserReturnEntity(userCreateRequest);
        // Tạo resident tương ứng với user mới
        Resident resident = new Resident();
        resident.setUserId(user.getId());
        resident.setFullName(request.getFullName());
        resident.setIdCardNumber(request.getIdCardNumber());
        resident.setStatus(user.getStatus() == com.mytech.apartment.portal.models.enums.UserStatus.ACTIVE ? 1 : 0);
        residentRepository.save(resident);
        // Tạo token xác thực email
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(expiry);
        emailVerificationTokenRepository.save(verificationToken);
        // Gửi email xác thực
        try {
            String verifyLink;
            if (origin != null && origin.contains(":3001")) {
                verifyLink = origin + "/verify-email?token=" + token;
            } else {
                verifyLink = frontendUrl + "/verify-email?token=" + token;
            }
            emailService.sendVerificationEmail(user.getEmail(), verifyLink);
        } catch (Exception e) {
            // Nếu gửi email thất bại, xóa user và resident đã tạo
            residentRepository.delete(resident);
            userRepository.delete(user);
            throw new RuntimeException("Đăng ký thất bại do không gửi được email xác thực: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyEmailToken(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Token xác thực không hợp lệ hoặc đã hết hạn"));
        if (LocalDateTime.now().isAfter(verificationToken.getExpiryDate())) {
            emailVerificationTokenRepository.deleteByToken(token);
            throw new RuntimeException("Token xác thực đã hết hạn");
        }
        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        emailVerificationTokenRepository.deleteByToken(token);
    }

    public void changePassword(ChangePasswordRequest request) {
        // Lấy user hiện tại từ security context
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy tài khoản");
        }
        
        User user = userOpt.get();
        
        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        
        // Kiểm tra mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        
        // Cập nhật mật khẩu
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void forgotPassword(String emailOrPhone) {
        // Kiểm tra user tồn tại
        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByPhoneNumber(emailOrPhone);
        }
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy tài khoản với email/số điện thoại này");
        }
        
        // Gửi OTP để reset password
        // sendOtp(emailOrPhone, "RESET_PASSWORD");
    }

    public void resetPassword(ResetPasswordRequest request) {
        // Trong thực tế, bạn sẽ validate token thay vì OTP
        // Ở đây tôi sẽ sử dụng OTP như một token đơn giản
        
        // Kiểm tra mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        
        // Tìm user bằng email hoặc phone (sử dụng key của otpStorage)
        Optional<User> userOpt = userRepository.findByEmail(request.getToken());
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByPhoneNumber(request.getToken());
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    @Transactional
    public void resendVerificationEmail(String emailOrPhone) {
        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByPhoneNumber(emailOrPhone);
        }
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy tài khoản với email/số điện thoại này");
        }
        User user = userOpt.get();
        if (UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản đã được xác thực!");
        }
        
        // Kiểm tra thời gian chờ 10 phút
        Optional<EmailVerificationToken> existingTokenOpt = emailVerificationTokenRepository.findByUser(user);
        if (existingTokenOpt.isPresent()) {
            EmailVerificationToken existingToken = existingTokenOpt.get();
            LocalDateTime now = LocalDateTime.now();
            // Sử dụng thời gian tạo token (expiry - 24h) để tính thời gian chờ
            LocalDateTime tokenCreated = existingToken.getExpiryDate().minusHours(24);
            if (now.isBefore(tokenCreated.plusMinutes(10))) {
                throw new RuntimeException("Vui lòng đợi 10 phút trước khi gửi lại email xác thực.");
            }
        }
        
        // Xóa token cũ
        emailVerificationTokenRepository.deleteByUser(user);
        // Tạo token mới
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(expiry);
        emailVerificationTokenRepository.save(verificationToken);
        // Gửi lại email xác thực
        String verifyLink = frontendUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), verifyLink);
    }
} 