package com.resqmesh.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AiConfig implements WebMvcConfigurer {

    @Value("${resqmesh.ai.model-path:classpath:model/resqmesh_final_validated_model.json}")
    private String modelPath;

    @Value("${resqmesh.ai.features-path:classpath:model/resqmesh_final_validated_features.json}")
    private String featuresPath;

    @Value("${resqmesh.ai.threshold-path:classpath:model/resqmesh_final_validated_threshold.json}")
    private String thresholdPath;

    @Value("${resqmesh.ai.model-version:resqmesh-final-validated}")
    private String modelVersion;

    @Value("${resqmesh.ai.thresholds.safe-max:0.35}")
    private double safeMax;

    @Value("${resqmesh.ai.thresholds.warning-max:0.50}")
    private double warningMax;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8086", "http://127.0.0.1:8086", "http://localhost:3000")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    public String getModelPath() {
        return modelPath;
    }

    public String getFeaturesPath() {
        return featuresPath;
    }

    public String getThresholdPath() {
        return thresholdPath;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public double getSafeMax() {
        return safeMax;
    }

    public double getWarningMax() {
        return warningMax;
    }
}
