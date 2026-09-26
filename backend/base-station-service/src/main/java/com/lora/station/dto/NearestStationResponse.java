package com.lora.station.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NearestStationResponse {

    private String stationId;
    private String stationName;
    private Double distance;
    private Double signalStrength;
    private Double signalQuality;
    private String status;
}