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
} 