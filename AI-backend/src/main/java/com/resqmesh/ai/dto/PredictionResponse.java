package com.resqmesh.ai.dto;

public class PredictionResponse {

    private double riskScore;
    private String riskLevel;
    private String binaryDecision;
    private double validatedThreshold;
    private String modelVersion;
    private String timestamp;
    private long latencyMs;
    private String message;

    public PredictionResponse() {
    }

    public PredictionResponse(double riskScore, String riskLevel, String binaryDecision, double validatedThreshold,
                              String modelVersion, String timestamp, long latencyMs, String message) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.binaryDecision = binaryDecision;
        this.validatedThreshold = validatedThreshold;
        this.modelVersion = modelVersion;
        this.timestamp = timestamp;
        this.latencyMs = latencyMs;
        this.message = message;
    }

    public double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getBinaryDecision() {
        return binaryDecision;
    }

    public void setBinaryDecision(String binaryDecision) {
        this.binaryDecision = binaryDecision;
    }

    public double getValidatedThreshold() {
        return validatedThreshold;
    }

    public void setValidatedThreshold(double validatedThreshold) {
        this.validatedThreshold = validatedThreshold;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public long getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(long latencyMs) {
        this.latencyMs = latencyMs;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
