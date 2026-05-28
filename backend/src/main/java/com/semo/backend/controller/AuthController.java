package com.semo.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.dto.LoginRequestDTO;
import com.semo.backend.dto.LoginResponseDTO;
import com.semo.backend.dto.UserRequestDTO;
import com.semo.backend.dto.UserResponseDTO;
import com.semo.backend.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO requestDTO) {
        UserResponseDTO responseDTO = authService.register(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        LoginResponseDTO responseDTO = authService.login(requestDTO);
        return ResponseEntity.ok(responseDTO);
    }
}
