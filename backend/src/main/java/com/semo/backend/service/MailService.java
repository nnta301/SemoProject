package com.semo.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã xác thực tài khoản SEMO của bạn");
            message.setText("Chào bạn,\n\n"
                    + "Cảm ơn bạn đã đăng ký tài khoản tại hệ thống SEMO.\n\n"
                    + "Mã xác thực (OTP) của bạn là: " + otp + "\n"
                    + "Mã này sẽ hết hạn trong vòng 5 phút.\n\n"
                    + "Trân trọng,\nĐội ngũ SEMO.");

            mailSender.send(message);
            System.out.println("Đã gửi email OTP thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email tới " + toEmail + ": " + e.getMessage());
        }
    }
}