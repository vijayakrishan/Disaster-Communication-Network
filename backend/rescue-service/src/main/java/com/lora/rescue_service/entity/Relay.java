package com.lora.rescue_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relay {
    private double coverageRadiusKm;
    private String id;
    private String name;
    private String status;

    private double lat;
    private double lng;

    private int battery;
    private double rssi;
    private double snr;

    private long packetCount;

    private LocalDateTime lastSeen;
}