package com.resqmesh.ai;

import com.resqmesh.ai.exception.InvalidFeatureException;
import com.resqmesh.ai.service.FeatureValidationService;
import com.resqmesh.ai.service.ModelLoaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class FeatureValidationServiceTest {

    @Autowired
    private FeatureValidationService featureValidationService;

    @Autowired
    private ModelLoaderService modelLoaderService;

    private Map<String, Object> validFeatures;

    @BeforeEach
    void setUp() {
        validFeatures = new HashMap<>();
        List<String> featureNames = modelLoaderService.getFeatureNames();
        for (String feat : featureNames) {
            validFeatures.put(feat, 1.5);
        }
    }

    @Test
    void testValidFeaturesExtraction() {
        float[] vector = featureValidationService.validateAndExtractFeatures(validFeatures);
        assertNotNull(vector);
        assertEquals(52, vector.length);
        for (float v : vector) {
            assertEquals(1.5f, v, 0.0001f);
        }
    }

    @Test
    void testNullPayloadThrowsException() {
        assertThrows(InvalidFeatureException.class, () -> featureValidationService.validateAndExtractFeatures(null));
    }

    @Test
    void testEmptyPayloadThrowsException() {
        assertThrows(InvalidFeatureException.class, () -> featureValidationService.validateAndExtractFeatures(new HashMap<>()));
    }

    @Test
    void testMissingFeatureThrowsException() {
        validFeatures.remove("temperature_2m");
        InvalidFeatureException ex = assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
        assertTrue(ex.getMessage().contains("temperature_2m"), "Message should mention missing feature");
    }

    @Test
    void testExtraFeatureThrowsException() {
        validFeatures.put("unsupported_calendar_feature", 123.0);
        assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
    }

    @Test
    void testNullFeatureValueThrowsException() {
        validFeatures.put("temperature_2m", null);
        assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
    }

    @Test
    void testNaNFeatureValueThrowsException() {
        validFeatures.put("temperature_2m", Double.NaN);
        assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
    }

    @Test
    void testInfiniteFeatureValueThrowsException() {
        validFeatures.put("temperature_2m", Double.POSITIVE_INFINITY);
        assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
    }

    @Test
    void testNonNumericStringThrowsException() {
        validFeatures.put("temperature_2m", "not-a-number");
        assertThrows(InvalidFeatureException.class,
                () -> featureValidationService.validateAndExtractFeatures(validFeatures));
    }
}
