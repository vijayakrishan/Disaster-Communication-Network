package com.lora.station.controller;

import com.lora.station.dto.NearestStationResponse;
import com.lora.station.service.BaseStationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class BaseStationController {

    private final BaseStationService baseStationService;

    public BaseStationController(
            BaseStationService baseStationService) {
        this.baseStationService = baseStationService;
    }

    @GetMapping("/nearest")
    public ResponseEntity<List<NearestStationResponse>> getNearestStations(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        List<NearestStationResponse> stations =
                baseStationService.getNearestStations(
                        latitude,
                        longitude
                );

        return ResponseEntity.ok(stations);
    }
}