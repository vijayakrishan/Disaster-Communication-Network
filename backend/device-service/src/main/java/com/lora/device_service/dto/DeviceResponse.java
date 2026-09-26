package com.lora.device_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResponse {

    private String deviceId;

    private String deviceName;

    private String status;

    private Double battery;

    private Double rssi;

    private Double snr;

    private String gpsStatus;

    private Double latitude;

    private Double longitude;

    private Double gpsPrecision;

    private Integer packetsSent;

    private String loraModule;

    private Double loraFrequency;

    private String lastSeen;
}