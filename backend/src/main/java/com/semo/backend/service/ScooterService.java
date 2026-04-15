package com.semo.backend.service;

import org.springframework.stereotype.Service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;

@Service
public class ScooterService {

    private final ScooterRepository scooterRepository;

    public ScooterService(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    public ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO) {
        Scooter scooter = new Scooter();
        scooter.setCodeName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel().doubleValue());
        scooter.setStatus(requestDTO.getStatus());

        Scooter savedScooter = scooterRepository.save(scooter);

        ScooterResponseDTO responseDTO = new ScooterResponseDTO();
        responseDTO.setId(savedScooter.getId().longValue());
        responseDTO.setName(savedScooter.getCodeName());
        responseDTO.setBatteryLevel(savedScooter.getBatteryLevel().intValue());
        responseDTO.setStatus(savedScooter.getStatus());

        return responseDTO;
    }
}
