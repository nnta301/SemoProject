package com.semo.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.LoginRequestDTO;
import com.semo.backend.dto.LoginResponseDTO;
import com.semo.backend.dto.UserRequestDTO;
import com.semo.backend.dto.UserResponseDTO;
import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.util.JwtTokenProvider;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
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
                requestDTO.getPhoneNumber());

        User savedUser = userRepository.save(user);
        return mapToUserResponseDTO(savedUser);
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
        return responseDTO;
    }
}
