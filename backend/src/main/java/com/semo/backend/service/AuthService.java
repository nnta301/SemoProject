package com.semo.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.*;
import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.util.JwtTokenProvider;
import com.semo.backend.service.MailService;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MailService mailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider, MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.mailService = mailService;
    }

    @Transactional
    public UserResponseDTO register(UserRequestDTO requestDTO) {
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User(
                requestDTO.getEmail(),
                passwordEncoder.encode(requestDTO.getPassword()),
                requestDTO.getFullName(),
                requestDTO.getPhoneNumber(),
                "CUSTOMER",
                0.0);

        user.setIsActive(false);
        String otp = generateOtp();
        user.setVerificationCode(otp);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(5));

        user = userRepository.save(user);

        mailService.sendVerificationEmail(user.getEmail(), otp);

        return mapToUserResponseDTO(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này."));

        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản này đã được xác thực rồi.");
        }

        if (user.getVerificationExpiry() == null || user.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.");
        }

        if (!requestDTO.getOtp().equals(user.getVerificationCode())) {
            throw new RuntimeException("Mã xác nhận không chính xác.");
        }

        user.setIsActive(true);
        user.setVerificationCode(null);
        user.setVerificationExpiry(null);

        userRepository.save(user);
    }

    private String generateOtp() {
        SecureRandom secureRandom = new SecureRandom();
        int otp = secureRandom.nextInt(1000000);

        return String.format("%06d", otp);
    }

    public LoginResponseDTO login(LoginRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getId());

        return new LoginResponseDTO(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getId());
    }

    private UserResponseDTO mapToUserResponseDTO(User user) {
        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setId(user.getId());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(user.getFullName());
        responseDTO.setPhoneNumber(user.getPhoneNumber());
        responseDTO.setRole(user.getRole());
        responseDTO.setCreatedAt(user.getCreatedAt());
        responseDTO.setUpdatedAt(user.getUpdatedAt());
        responseDTO.setBalance(user.getBalance());
        responseDTO.setIsActive(user.getIsActive());
        return responseDTO;
    }
}
