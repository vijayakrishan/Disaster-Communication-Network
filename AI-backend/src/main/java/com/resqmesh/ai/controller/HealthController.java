package com.resqmesh.ai.controller;

import com.resqmesh.ai.dto.HealthResponse;
import com.resqmesh.ai.service.ModelLoaderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class HealthController {

    private final ModelLoaderService modelLoaderService;

    public HealthController(ModelLoaderService modelLoaderService) {
        this.modelLoaderService = modelLoaderService;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        boolean loaded = modelLoaderService.isModelLoaded();
        String status = loaded ? "UP" : "DOWN";
        String message = loaded
                ? "RESQMESH AI Decision Support Service is operational and model is loaded."
                : "RESQMESH AI Model is unavailable: " + modelLoaderService.getLoadErrorMessage();

        HealthResponse response = new HealthResponse(
                status,
                loaded,
                modelLoaderService.getModelVersion(),
                modelLoaderService.getFeatureCount(),
                modelLoaderService.getValidatedThreshold(),
                message
        );

        return loaded ? ResponseEntity.ok(response) : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
