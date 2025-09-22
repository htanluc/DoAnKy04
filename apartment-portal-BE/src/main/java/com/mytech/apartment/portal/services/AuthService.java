package com.mytech.apartment.portal.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Random;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

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

import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.services.SmartActivityLogService;

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
    private SmartActivityLogService smartActivityLogService;



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
        userCreateRequest.setFullName(request.getFullName());
        userCreateRequest.setIdCardNumber(request.getIdCardNumber());
        userCreateRequest.setDateOfBirth(request.getDateOfBirth());
        // Không set roles để UserService.registerUser tự gán role RESIDENT
        User user = userService.registerUserReturnEntity(userCreateRequest);
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
            // Nếu gửi email thất bại, xóa user đã tạo
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
        // Security đang set username = phoneNumber khi đăng nhập
        // Vì dữ liệu cũ có thể chưa đồng bộ trường username, ta ưu tiên tìm theo phoneNumber
        Optional<User> userOpt = userRepository.findByPhoneNumber(currentUsername);
        if (!userOpt.isPresent()) {
            // Fallback: thử tìm theo username để đảm bảo tương thích dữ liệu
            userOpt = userRepository.findByUsername(currentUsername);
        }
        
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

    /**
     * Quên mật khẩu với số điện thoại và email - tạo mật khẩu ngẫu nhiên và gửi qua email
     */
    public void forgotPasswordWithPhoneAndEmail(String phoneNumber, String email) {
        // Tìm user theo số điện thoại
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy tài khoản với số điện thoại này");
        }
        
        User user = userOpt.get();
        
        // Kiểm tra email có khớp với email trong database không
        if (!email.equals(user.getEmail())) {
            throw new RuntimeException("Email không khớp với tài khoản đã đăng ký");
        }
        
        // Tạo mật khẩu ngẫu nhiên
        String newPassword = generateRandomPassword();
        
        // Mã hóa mật khẩu mới
        String encodedPassword = passwordEncoder.encode(newPassword);
        
        // Cập nhật mật khẩu trong database
        user.setPasswordHash(encodedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Gửi email chứa mật khẩu mới
        try {
            emailService.sendNewPasswordEmail(user.getEmail(), newPassword, user.getFullName());
            
            // Log hoạt động
            smartActivityLogService.logSmartActivity(ActivityActionType.PASSWORD_CHANGE, 
                "Đặt lại mật khẩu thành công qua email cho số điện thoại: " + phoneNumber);
                
        } catch (Exception e) {
            // Nếu gửi email thất bại, rollback mật khẩu cũ
            user.setPasswordHash(user.getPasswordHash()); // Giữ nguyên mật khẩu cũ
            userRepository.save(user);
            throw new RuntimeException("Không thể gửi email mật khẩu mới: " + e.getMessage());
        }
    }

    /**
     * Tạo mật khẩu ngẫu nhiên
     */
    private String generateRandomPassword() {
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String specialChars = "!@#$%^&*";
        
        String allChars = upperCase + lowerCase + numbers + specialChars;
        Random random = new Random();
        
        StringBuilder password = new StringBuilder();
        
        // Đảm bảo mật khẩu có ít nhất 1 ký tự từ mỗi loại
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(numbers.charAt(random.nextInt(numbers.length())));
        password.append(specialChars.charAt(random.nextInt(specialChars.length())));
        
        // Thêm 4 ký tự ngẫu nhiên nữa để đủ 8 ký tự
        for (int i = 0; i < 4; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // Trộn thứ tự các ký tự
        List<Character> chars = password.toString().chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(chars);
        
        return chars.stream()
                .map(String::valueOf)
                .collect(Collectors.joining());
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