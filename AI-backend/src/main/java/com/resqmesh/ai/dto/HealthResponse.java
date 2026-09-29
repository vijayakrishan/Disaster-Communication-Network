package com.resqmesh.ai.dto;

public class HealthResponse {

    private String status;
    private boolean modelLoaded;
    private String modelVersion;
    private int featureCount;
    private double threshold;
    private String message;

    public HealthResponse() {
    }

    public HealthResponse(String status, boolean modelLoaded, String modelVersion, int featureCount, double threshold, String message) {
        this.status = status;
        this.modelLoaded = modelLoaded;
        this.modelVersion = modelVersion;
        this.featureCount = featureCount;
        this.threshold = threshold;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isModelLoaded() {
        return modelLoaded;
    }

    public void setModelLoaded(boolean modelLoaded) {
        this.modelLoaded = modelLoaded;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public int getFeatureCount() {
        return featureCount;
    }

    public void setFeatureCount(int featureCount) {
        this.featureCount = featureCount;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
