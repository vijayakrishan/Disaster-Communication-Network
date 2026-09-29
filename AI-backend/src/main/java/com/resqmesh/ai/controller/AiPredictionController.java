package com.resqmesh.ai.controller;

import com.resqmesh.ai.dto.PredictionRequest;
import com.resqmesh.ai.dto.PredictionResponse;
import com.resqmesh.ai.service.AiPredictionService;
import com.resqmesh.ai.service.ModelLoaderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiPredictionController {

    private final AiPredictionService aiPredictionService;
    private final ModelLoaderService modelLoaderService;

    public AiPredictionController(AiPredictionService aiPredictionService, ModelLoaderService modelLoaderService) {
        this.aiPredictionService = aiPredictionService;
        this.modelLoaderService = modelLoaderService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictionResponse> predict(@RequestBody PredictionRequest request) {
        PredictionResponse response = aiPredictionService.predict(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/features")
    public ResponseEntity<Map<String, Object>> getFeatures() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("featureCount", modelLoaderService.getFeatureCount());
        data.put("features", modelLoaderService.getFeatureNames());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/demo-scenarios")
    public ResponseEntity<Map<String, Object>> getDemoScenarios() {
        Map<String, Object> scenarios = new LinkedHashMap<>();

        // Normal / Safe Demo Scenario (extracted from historical non-flood records)
        Map<String, Object> safe = new LinkedHashMap<>();
        safe.put("temperature_2m", 28.5);
        safe.put("relative_humidity_2m", 56.0);
        safe.put("dew_point_2m", 18.9);
        safe.put("precipitation", 0.0);
        safe.put("rain", 0.0);
        safe.put("surface_pressure", 1003.1);
        safe.put("cloud_cover", 0.0);
        safe.put("cloud_cover_low", 0.0);
        safe.put("wind_speed_10m", 16.1);
        safe.put("wind_direction_10m", 42.0);
        safe.put("rain_binary", 0.0);
        safe.put("temperature_humidity_index", 15.96);
        safe.put("wind_u", -10.77);
        safe.put("wind_v", -11.96);
        safe.put("rain_3h", 0.0);
        safe.put("rain_6h", 0.0);
        safe.put("rain_12h", 0.1);
        safe.put("rain_24h", 0.1);
        safe.put("rain_48h", 0.2);
        safe.put("precip_3h", 0.0);
        safe.put("precip_6h", 0.0);
        safe.put("precip_12h", 0.1);
        safe.put("precip_24h", 0.1);
        safe.put("precip_48h", 0.2);
        safe.put("rain_3h_max", 0.0);
        safe.put("rain_6h_max", 0.0);
        safe.put("rain_12h_max", 0.1);
        safe.put("rain_24h_max", 0.1);
        safe.put("humidity_6h_mean", 52.0);
        safe.put("humidity_12h_mean", 64.17);
        safe.put("humidity_24h_mean", 72.33);
        safe.put("humidity_24h_max", 94.0);
        safe.put("temperature_6h_mean", 29.1);
        safe.put("temperature_24h_mean", 24.2);
        safe.put("temperature_24h_min", 20.1);
        safe.put("temperature_24h_max", 29.9);
        safe.put("cloud_6h_mean", 66.67);
        safe.put("cloud_12h_mean", 65.25);
        safe.put("cloud_24h_mean", 74.46);
        safe.put("pressure_change_3h", -1.3);
        safe.put("pressure_change_6h", -4.3);
        safe.put("pressure_change_12h", -1.1);
        safe.put("pressure_change_24h", 0.3);
        safe.put("rain_change_1h", 0.0);
        safe.put("rain_change_3h", 0.0);
        safe.put("rain_change_6h", 0.0);
        safe.put("is_heavy_rain_3h", 0.0);
        safe.put("is_heavy_rain_6h", 0.0);
        safe.put("is_heavy_rain_24h", 0.0);
        safe.put("is_extreme_rain_24h", 0.0);
        safe.put("rain_acceleration", 0.0);
        safe.put("humidity_pressure_risk", 311.03);

        // High Risk Demo Scenario (actual historical 2023 flood event sample with prob > 0.50)
        Map<String, Object> highRisk = new LinkedHashMap<>();
        highRisk.put("temperature_2m", 24.2);
        highRisk.put("relative_humidity_2m", 84.0);
        highRisk.put("dew_point_2m", 21.4);
        highRisk.put("precipitation", 0.7);
        highRisk.put("rain", 0.7);
        highRisk.put("surface_pressure", 1006.6);
        highRisk.put("cloud_cover", 100.0);
        highRisk.put("cloud_cover_low", 22.0);
        highRisk.put("wind_speed_10m", 28.4);
        highRisk.put("wind_direction_10m", 38.0);
        highRisk.put("rain_binary", 1.0);
        highRisk.put("temperature_humidity_index", 20.33);
        highRisk.put("wind_u", -17.48);
        highRisk.put("wind_v", -22.38);
        highRisk.put("rain_3h", 1.2);
        highRisk.put("rain_6h", 1.7);
        highRisk.put("rain_12h", 4.2);
        highRisk.put("rain_24h", 236.7);
        highRisk.put("rain_48h", 512.9);
        highRisk.put("precip_3h", 1.2);
        highRisk.put("precip_6h", 1.7);
        highRisk.put("precip_12h", 4.2);
        highRisk.put("precip_24h", 236.7);
        highRisk.put("precip_48h", 512.9);
        highRisk.put("rain_3h_max", 0.7);
        highRisk.put("rain_6h_max", 0.7);
        highRisk.put("rain_12h_max", 1.3);
        highRisk.put("rain_24h_max", 59.8);
        highRisk.put("humidity_6h_mean", 83.33);
        highRisk.put("humidity_12h_mean", 84.75);
        highRisk.put("humidity_24h_mean", 88.54);
        highRisk.put("humidity_24h_max", 93.0);
        highRisk.put("temperature_6h_mean", 24.15);
        highRisk.put("temperature_24h_mean", 24.31);
        highRisk.put("temperature_24h_min", 23.8);
        highRisk.put("temperature_24h_max", 25.1);
        highRisk.put("cloud_6h_mean", 100.0);
        highRisk.put("cloud_12h_mean", 100.0);
        highRisk.put("cloud_24h_mean", 100.0);
        highRisk.put("pressure_change_3h", 0.1);
        highRisk.put("pressure_change_6h", -1.8);
        highRisk.put("pressure_change_12h", 0.0);
        highRisk.put("pressure_change_24h", 1.2);
        highRisk.put("rain_change_1h", 0.5);
        highRisk.put("rain_change_3h", 0.4);
        highRisk.put("rain_change_6h", 0.5);
        highRisk.put("is_heavy_rain_3h", 0.0);
        highRisk.put("is_heavy_rain_6h", 0.0);
        highRisk.put("is_heavy_rain_24h", 1.0);
        highRisk.put("is_extreme_rain_24h", 1.0);
        highRisk.put("rain_acceleration", 0.35);
        highRisk.put("humidity_pressure_risk", 159.37);

        scenarios.put("safe", safe);
        scenarios.put("highRisk", highRisk);

        return ResponseEntity.ok(scenarios);
    }
}
