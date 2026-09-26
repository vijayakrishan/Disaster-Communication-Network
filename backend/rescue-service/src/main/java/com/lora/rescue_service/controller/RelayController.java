package com.lora.rescue_service.controller;

import com.lora.rescue_service.dto.RelayMetricsDTO;
import com.lora.rescue_service.dto.RelayTelemetryDTO;
import com.lora.rescue_service.entity.Relay;
import com.lora.rescue_service.service.RelayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relays")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5180"
})
public class RelayController {

    private final RelayService relayService;

    public RelayController(
            RelayService relayService) {

        this.relayService =
                relayService;
    }

    // =====================================================
    // GET ALL RELAYS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Relay>>
    getAllRelays() {

        return ResponseEntity.ok(
                relayService.getAllRelays()
        );
    }

    // =====================================================
    // GET METRICS
    // =====================================================

    @GetMapping("/metrics")
    public ResponseEntity<RelayMetricsDTO>
    getMetrics() {

        return ResponseEntity.ok(
                relayService.getMetrics()
        );
    }

    // =====================================================
    // GET ONE RELAY
    // =====================================================

    @GetMapping("/{relayId}")
    public ResponseEntity<?> getRelayById(
            @PathVariable String relayId) {

        try {

            return ResponseEntity.ok(
                    relayService.getRelayById(
                            relayId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // RECEIVE HARDWARE TELEMETRY
    // =====================================================

    @PostMapping("/telemetry")
    public ResponseEntity<?> receiveTelemetry(
            @RequestBody RelayTelemetryDTO telemetry) {

        try {

            Relay updatedRelay =
                    relayService.updateTelemetry(
                            telemetry
                    );

            return ResponseEntity.ok(
                    updatedRelay
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}