package com.resqmesh.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmesh.ai.config.AiConfig;
import com.resqmesh.ai.exception.ModelNotLoadedException;
import jakarta.annotation.PostConstruct;
import ml.dmlc.xgboost4j.java.Booster;
import ml.dmlc.xgboost4j.java.DMatrix;
import ml.dmlc.xgboost4j.java.XGBoost;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ModelLoaderService {

    private static final Logger log = LoggerFactory.getLogger(ModelLoaderService.class);

    private final AiConfig aiConfig;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    private Booster booster;
    private List<String> featureNames = new ArrayList<>();
    private double validatedThreshold = 0.50;
    private boolean modelLoaded = false;
    private String loadErrorMessage = null;

    public ModelLoaderService(AiConfig aiConfig, ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.aiConfig = aiConfig;
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        log.info("====================================================================");
        log.info("Initializing RESQMESH AI Model Loader Service...");
        log.info("====================================================================");

        try {
            loadFeatures();
            loadThreshold();
            loadModel();
            this.modelLoaded = true;
            log.info("RESQMESH AI Model successfully initialized and ready for inference.");
            log.info("Model Version   : {}", aiConfig.getModelVersion());
            log.info("Feature Count   : {}", featureNames.size());
            log.info("Frozen Threshold: {}", validatedThreshold);
            log.info("====================================================================");
        } catch (Exception e) {
            this.modelLoaded = false;
            this.loadErrorMessage = e.getMessage();
            log.error("CRITICAL: Failed to load RESQMESH AI Model: {}", e.getMessage(), e);
        }
    }

    private void loadFeatures() throws Exception {
        String featuresPath = aiConfig.getFeaturesPath();
        log.info("Loading feature schema from: {}", featuresPath);
        Resource resource = resourceLoader.getResource(featuresPath);
        try (InputStream is = resource.getInputStream()) {
            featureNames = objectMapper.readValue(is, new TypeReference<List<String>>() {});
        }
        log.info("Loaded {} features in strict validation order.", featureNames.size());
    }

    private void loadThreshold() throws Exception {
        String thresholdPath = aiConfig.getThresholdPath();
        log.info("Loading threshold metadata from: {}", thresholdPath);
        Resource resource = resourceLoader.getResource(thresholdPath);
        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            if (root.has("selected_threshold")) {
                validatedThreshold = root.get("selected_threshold").asDouble();
            } else {
                validatedThreshold = 0.50;
            }
        }
        log.info("Validated decision threshold set to: {}", validatedThreshold);
    }

    private void loadModel() throws Exception {
        String modelPath = aiConfig.getModelPath();
        log.info("Loading XGBoost JSON model from: {}", modelPath);
        Resource resource = resourceLoader.getResource(modelPath);

        // Copy resource to a temporary file so the native XGBoost C++ engine can load it
        File tempModelFile = Files.createTempFile("resqmesh_xgb_", ".json").toFile();
        tempModelFile.deleteOnExit();

        try (InputStream in = resource.getInputStream();
             FileOutputStream out = new FileOutputStream(tempModelFile)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
        }

        log.info("Model file prepared at: {} (Size: {} bytes)", tempModelFile.getAbsolutePath(), tempModelFile.length());
        this.booster = XGBoost.loadModel(tempModelFile.getAbsolutePath());
        log.info("XGBoost native Booster loaded successfully.");
    }

    public synchronized float predict(float[] features) {
        if (!modelLoaded || booster == null) {
            throw new ModelNotLoadedException("AI model is not loaded: " + (loadErrorMessage != null ? loadErrorMessage : "Service uninitialized"));
        }

        try {
            DMatrix dMatrix = new DMatrix(features, 1, features.length, Float.NaN);
            float[][] predictions = booster.predict(dMatrix);
            return predictions[0][0];
        } catch (Exception e) {
            log.error("Inference execution failed: {}", e.getMessage(), e);
            throw new RuntimeException("Model inference failed: " + e.getMessage(), e);
        }
    }

    public boolean isModelLoaded() {
        return modelLoaded;
    }

    public List<String> getFeatureNames() {
        return Collections.unmodifiableList(featureNames);
    }

    public int getFeatureCount() {
        return featureNames.size();
    }

    public double getValidatedThreshold() {
        return validatedThreshold;
    }

    public String getModelVersion() {
        return aiConfig.getModelVersion();
    }

    public String getLoadErrorMessage() {
        return loadErrorMessage;
    }
}
