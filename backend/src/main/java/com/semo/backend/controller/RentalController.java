package com.semo.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.service.RentalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping("/active")
    public ResponseEntity<RentalResponseDTO> getActiveRental(@RequestParam Integer userId) {
        RentalResponseDTO dto = rentalService.getActiveRentalForUser(userId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    // 1. API Bắt đầu thuê xe
    @PostMapping("/start")
    public ResponseEntity<RentalResponseDTO> startRental(@Valid @RequestBody RentalRequestDTO requestDTO) {
        RentalResponseDTO responseDTO = rentalService.startRental(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // 2. API Kết thúc thuê xe (Trả xe)
    @PutMapping("/{id}/end")
    public ResponseEntity<RentalResponseDTO> endRental(@PathVariable Integer id) {
        RentalResponseDTO responseDTO = rentalService.endRental(id);
        return ResponseEntity.ok(responseDTO);
    }
}