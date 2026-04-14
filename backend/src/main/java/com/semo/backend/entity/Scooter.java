package com.semo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scooters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Scooter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String codeName;
    private String status = "AVAILABLE";
    private float batteryLevel = 100.0f;
    private int cycleCount = 0;
    private float stateOfHealth = 100.0f;
    private float temperature = 25.0f;
    private double currentLat;
    private double currentLng;
}