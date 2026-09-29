package com.resqmesh.ai.service;

import com.resqmesh.ai.config.AiConfig;
import com.resqmesh.ai.dto.PredictionRequest;
import com.resqmesh.ai.dto.PredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
public class AiPredictionService {

    private static final Logger log = LoggerFactory.getLogger(AiPredictionService.class);

    private final ModelLoaderService modelLoaderService;
    private final FeatureValidationService featureValidationService;
    private final AiConfig aiConfig;

    public AiPredictionService(ModelLoaderService modelLoaderService,
                               FeatureValidationService featureValidationService,
                               AiConfig aiConfig) {
        this.modelLoaderService = modelLoaderService;
        this.featureValidationService = featureValidationService;
        this.aiConfig = aiConfig;
    }

    public PredictionResponse predict(PredictionRequest request) {
        long startTime = System.currentTimeMillis();

        // 1. Validate features strictly and extract feature vector in exact order
        float[] featureVector = featureValidationService.validateAndExtractFeatures(request.getFeatures());

        // 2. Perform native XGBoost inference
        float rawScore = modelLoaderService.predict(featureVector);

        // Clamp between 0.0 and 1.0 if minor float precision anomaly
        double riskScore = Math.max(0.0, Math.min(1.0, (double) rawScore));
        riskScore = BigDecimal.valueOf(riskScore).setScale(4, RoundingMode.HALF_UP).doubleValue();

        long latencyMs = System.currentTimeMillis() - startTime;

        // 3. Operational categorization
        double safeMax = aiConfig.getSafeMax();
        double warningMax = aiConfig.getWarningMax();
        double validatedThreshold = modelLoaderService.getValidatedThreshold();

        String riskLevel;
        if (riskScore < safeMax) {
            riskLevel = "SAFE";
        } else if (riskScore < warningMax) {
            riskLevel = "WARNING";
        } else {
            riskLevel = "DANGER";
        }

        // Binary classification based on frozen research threshold
        String binaryDecision = (riskScore >= validatedThreshold) ? "DISASTER_RISK_ALERT" : "NORMAL";

        log.info("Prediction completed in {}ms: riskScore={}, riskLevel={}, decision={}",
                latencyMs, riskScore, riskLevel, binaryDecision);

        return new PredictionResponse(
                riskScore,
                riskLevel,
                binaryDecision,
                validatedThreshold,
                modelLoaderService.getModelVersion(),
                Instant.now().toString(),
                latencyMs,
                "AI-based disaster risk estimation / decision support"
        );
    }
}
