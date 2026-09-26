package com.lora.rescue_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelayMetricsDTO {

    private long onlineRelays;

    private long offlineRelays;

    private double averageRssi;

    private double averageBattery;

    private double averageSnr;

    private long totalPackets;

    private double coverageArea;

    private List<List<Double>> coverageBoundary;
}