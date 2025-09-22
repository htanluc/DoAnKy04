package com.mytech.apartment.portal.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String verificationLink) {
        try {
            logger.info("[EmailService] Bắt đầu gửi email xác nhận tới: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Xác nhận đăng ký tài khoản");
            helper.setText("<p>Chào bạn,</p>"
                + "<p>Vui lòng nhấn vào link dưới đây để xác nhận email và kích hoạt tài khoản:</p>"
                + "<p><a href='" + verificationLink + "'>Xác nhận tài khoản</a></p>"
                + "<br/><p>Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.</p>", true);
            mailSender.send(message);
            logger.info("[EmailService] Gửi email xác nhận thành công tới: {}", to);
        } catch (MessagingException e) {
            logger.error("[EmailService] Lỗi khi gửi email xác nhận tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không gửi được email xác nhận: " + e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String subject, String content) {
        try {
            logger.info("[EmailService] Bắt đầu gửi OTP tới: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            logger.info("[EmailService] Gửi OTP thành công tới: {}", to);
        } catch (MessagingException e) {
            logger.error("[EmailService] Lỗi khi gửi OTP tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không gửi được email OTP: " + e.getMessage());
        }
    }

    /**
     * Gửi email HTML tổng quát
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            logger.info("[EmailService] Gửi email tới: {} | Subject: {}", to, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("[EmailService] Gửi email thành công tới: {}", to);
        } catch (MessagingException e) {
            logger.error("[EmailService] Lỗi khi gửi email tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không gửi được email: " + e.getMessage());
        }
    }

    /**
     * Gửi email HTML kèm file đính kèm (PDF, ...)
     */
    @Async
    public void sendHtmlWithAttachment(String to, String subject, String htmlContent, String filename, byte[] data) {
        try {
            logger.info("[EmailService] Gửi email (đính kèm) tới: {} | Subject: {}", to, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            if (data != null && data.length > 0) {
                helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(data));
            }
            mailSender.send(message);
            logger.info("[EmailService] Gửi email (đính kèm) thành công tới: {}", to);
        } catch (MessagingException e) {
            logger.error("[EmailService] Lỗi khi gửi email (đính kèm) tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không gửi được email: " + e.getMessage());
        }
    }

    /**
     * Gửi email mật khẩu mới cho chức năng quên mật khẩu
     */
    @Async
    public void sendNewPasswordEmail(String to, String newPassword, String fullName) {
        try {
            logger.info("[EmailService] Bắt đầu gửi email mật khẩu mới tới: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Mật khẩu mới - Hệ thống quản lý chung cư");
            
            String htmlContent = buildNewPasswordEmailContent(fullName, newPassword);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("[EmailService] Gửi email mật khẩu mới thành công tới: {}", to);
        } catch (MessagingException e) {
            logger.error("[EmailService] Lỗi khi gửi email mật khẩu mới tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không gửi được email mật khẩu mới: " + e.getMessage());
        }
    }

    /**
     * Xây dựng nội dung email mật khẩu mới
     */
    private String buildNewPasswordEmailContent(String fullName, String newPassword) {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Mật khẩu mới</title>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-top: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }" +
                ".header h1 { margin: 0; font-size: 24px; }" +
                ".content { padding: 20px 0; }" +
                ".password-box { background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }" +
                ".password { font-size: 24px; font-weight: bold; color: #e74c3c; letter-spacing: 2px; font-family: 'Courier New', monospace; }" +
                ".warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }" +
                ".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }" +
                ".btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🏢 Hệ thống quản lý chung cư</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Chào " + (fullName != null ? fullName : "bạn") + "!</h2>" +
                "<p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Dưới đây là mật khẩu mới để bạn có thể đăng nhập vào hệ thống:</p>" +
                "<div class='password-box'>" +
                "<p style='margin: 0 0 10px 0; font-weight: bold;'>Mật khẩu mới của bạn:</p>" +
                "<div class='password'>" + newPassword + "</div>" +
                "</div>" +
                "<div class='warning'>" +
                "<p><strong>⚠️ Lưu ý quan trọng:</strong></p>" +
                "<ul style='margin: 10px 0; padding-left: 20px;'>" +
                "<li>Vui lòng đổi mật khẩu này ngay sau khi đăng nhập</li>" +
                "<li>Không chia sẻ mật khẩu với bất kỳ ai</li>" +
                "<li>Mật khẩu này chỉ có hiệu lực trong thời gian ngắn</li>" +
                "</ul>" +
                "</div>" +
                "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với quản trị viên ngay lập tức.</p>" +
                "<p style='text-align: center; margin: 30px 0;'>" +
                "<a href='http://localhost:3001/login' class='btn'>Đăng nhập ngay</a>" +
                "</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Email này được gửi tự động từ hệ thống quản lý chung cư</p>" +
                "<p>Nếu có thắc mắc, vui lòng liên hệ: <strong>support@apartment.com</strong></p>" +
                "<p>© 2024 Hệ thống quản lý chung cư. Tất cả quyền được bảo lưu.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
} 