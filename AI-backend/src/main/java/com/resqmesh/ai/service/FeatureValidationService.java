package com.resqmesh.ai.service;

import com.resqmesh.ai.exception.InvalidFeatureException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FeatureValidationService {

    private final ModelLoaderService modelLoaderService;

    public FeatureValidationService(ModelLoaderService modelLoaderService) {
        this.modelLoaderService = modelLoaderService;
    }

    /**
     * Validates input features map against the expected 52 physical + temporal feature schema.
     * Rejects missing, unknown, null, NaN, infinite, or non-numeric values.
     * Returns a float array in the exact feature ordering required by the model.
     *
     * @param features Map of feature name to numeric value
     * @return float array corresponding strictly to model feature order
     */
    public float[] validateAndExtractFeatures(Map<String, Object> features) {
        if (features == null || features.isEmpty()) {
            throw new InvalidFeatureException("Features payload cannot be null or empty.");
        }

        List<String> expectedFeatures = modelLoaderService.getFeatureNames();
        int expectedCount = expectedFeatures.size();

        // Check feature count
        if (features.size() != expectedCount) {
            List<String> missing = new ArrayList<>();
            for (String expected : expectedFeatures) {
                if (!features.containsKey(expected)) {
                    missing.add(expected);
                }
            }

            List<String> extra = new ArrayList<>();
            Set<String> expectedSet = new HashSet<>(expectedFeatures);
            for (String key : features.keySet()) {
                if (!expectedSet.contains(key)) {
                    extra.add(key);
                }
            }

            StringBuilder sb = new StringBuilder();
            sb.append("Feature count mismatch. Expected ").append(expectedCount)
                    .append(" features, but received ").append(features.size()).append(".");
            if (!missing.isEmpty()) {
                sb.append(" Missing features (").append(missing.size()).append("): ").append(missing).append(".");
            }
            if (!extra.isEmpty()) {
                sb.append(" Unknown features (").append(extra.size()).append("): ").append(extra).append(".");
            }
            throw new InvalidFeatureException(sb.toString());
        }

        // Check for missing features
        List<String> missingFeatures = new ArrayList<>();
        for (String expected : expectedFeatures) {
            if (!features.containsKey(expected)) {
                missingFeatures.add(expected);
            }
        }
        if (!missingFeatures.isEmpty()) {
            throw new InvalidFeatureException("Missing required features: " + missingFeatures);
        }

        // Check for extra/unknown features
        Set<String> expectedSet = new HashSet<>(expectedFeatures);
        List<String> extraFeatures = new ArrayList<>();
        for (String key : features.keySet()) {
            if (!expectedSet.contains(key)) {
                extraFeatures.add(key);
            }
        }
        if (!extraFeatures.isEmpty()) {
            throw new InvalidFeatureException("Unknown features received: " + extraFeatures);
        }

        // Extract and validate numeric values in exact expected order
        float[] vector = new float[expectedCount];
        for (int i = 0; i < expectedCount; i++) {
            String featureName = expectedFeatures.get(i);
            Object rawValue = features.get(featureName);

            if (rawValue == null) {
                throw new InvalidFeatureException("Feature '" + featureName + "' value cannot be null.");
            }

            double numValue;
            if (rawValue instanceof Number number) {
                numValue = number.doubleValue();
            } else if (rawValue instanceof String str) {
                try {
                    numValue = Double.parseDouble(str.trim());
                } catch (NumberFormatException e) {
                    throw new InvalidFeatureException("Feature '" + featureName + "' must be a numeric value, but got: '" + rawValue + "'");
                }
            } else if (rawValue instanceof Boolean bool) {
                numValue = bool ? 1.0 : 0.0;
            } else {
                throw new InvalidFeatureException("Feature '" + featureName + "' has unsupported type: " + rawValue.getClass().getSimpleName());
            }

            if (Double.isNaN(numValue)) {
                throw new InvalidFeatureException("Feature '" + featureName + "' contains invalid NaN value.");
            }

            if (Double.isInfinite(numValue)) {
                throw new InvalidFeatureException("Feature '" + featureName + "' contains infinite value.");
            }

            vector[i] = (float) numValue;
        }

        return vector;
    }
}
