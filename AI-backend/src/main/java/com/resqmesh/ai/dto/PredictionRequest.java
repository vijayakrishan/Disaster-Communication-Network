package com.resqmesh.ai.dto;

import java.util.Map;

public class PredictionRequest {

    private Map<String, Object> features;

    public PredictionRequest() {
    }

    public PredictionRequest(Map<String, Object> features) {
        this.features = features;
    }

    public Map<String, Object> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Object> features) {
        this.features = features;
    }
}
