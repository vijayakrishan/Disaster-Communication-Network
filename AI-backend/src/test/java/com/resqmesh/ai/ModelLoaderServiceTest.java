package com.resqmesh.ai;

import com.resqmesh.ai.service.ModelLoaderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ModelLoaderServiceTest {

    @Autowired
    private ModelLoaderService modelLoaderService;

    @Test
    void testModelSuccessfullyLoaded() {
        assertTrue(modelLoaderService.isModelLoaded(), "Model should be loaded at application startup");
        assertEquals(52, modelLoaderService.getFeatureCount(), "Exact feature count must be 52");
        assertEquals("resqmesh-final-validated", modelLoaderService.getModelVersion());
        assertEquals(0.50, modelLoaderService.getValidatedThreshold(), 0.001);
    }

    @Test
    void testPredictionWithValidVector() {
        float[] sample = new float[52];
        for (int i = 0; i < 52; i++) {
            sample[i] = 1.0f;
        }

        float score = modelLoaderService.predict(sample);
        assertTrue(score >= 0.0f && score <= 1.0f, "Predicted score should be in [0, 1] range: " + score);
    }
}
