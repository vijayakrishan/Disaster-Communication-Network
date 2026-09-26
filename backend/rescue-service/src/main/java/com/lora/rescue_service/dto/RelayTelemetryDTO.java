package com.lora.rescue_service.dto;

import lombok.Data;

@Data
public class RelayTelemetryDTO {

    private String relayId;

    private String name;

    private Integer battery;

    private Double rssi;

    private Double snr;

    private Double lat;

    private Double lng;
}