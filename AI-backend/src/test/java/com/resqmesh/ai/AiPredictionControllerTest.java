package com.resqmesh.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmesh.ai.dto.PredictionRequest;
import com.resqmesh.ai.service.ModelLoaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AiPredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ModelLoaderService modelLoaderService;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> sampleValidFeatures;

    @BeforeEach
    void setUp() {
        sampleValidFeatures = new HashMap<>();
        List<String> featureNames = modelLoaderService.getFeatureNames();
        for (String feat : featureNames) {
            sampleValidFeatures.put(feat, 0.5);
        }
    }

    @Test
    void testHealthEndpointReturnsUp() throws Exception {
        mockMvc.perform(get("/api/ai/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.modelLoaded", is(true)))
                .andExpect(jsonPath("$.featureCount", is(52)))
                .andExpect(jsonPath("$.modelVersion", is("resqmesh-final-validated")));
    }

    @Test
    void testFeaturesEndpoint() throws Exception {
        mockMvc.perform(get("/api/ai/features"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featureCount", is(52)))
                .andExpect(jsonPath("$.features", hasSize(52)));
    }

    @Test
    void testDemoScenariosEndpoint() throws Exception {
        mockMvc.perform(get("/api/ai/demo-scenarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.safe", notNullValue()))
                .andExpect(jsonPath("$.highRisk", notNullValue()));
    }

    @Test
    void testPredictWithValidPayload() throws Exception {
        PredictionRequest request = new PredictionRequest(sampleValidFeatures);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore", notNullValue()))
                .andExpect(jsonPath("$.riskLevel", anyOf(is("SAFE"), is("WARNING"), is("DANGER"))))
                .andExpect(jsonPath("$.binaryDecision", anyOf(is("NORMAL"), is("DISASTER_RISK_ALERT"))))
                .andExpect(jsonPath("$.modelVersion", is("resqmesh-final-validated")))
                .andExpect(jsonPath("$.validatedThreshold", is(0.50)));
    }

    @Test
    void testPredictWithMissingFeatureReturns400() throws Exception {
        sampleValidFeatures.remove("temperature_2m");
        PredictionRequest request = new PredictionRequest(sampleValidFeatures);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("Missing features")));
    }

    @Test
    void testPredictWithUnknownFeatureReturns400() throws Exception {
        sampleValidFeatures.put("unregistered_sensor", 99.9);
        PredictionRequest request = new PredictionRequest(sampleValidFeatures);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Unknown features")));
    }

    @Test
    void testPredictWithInvalidNonNumericReturns400() throws Exception {
        sampleValidFeatures.put("temperature_2m", "abc_invalid");
        PredictionRequest request = new PredictionRequest(sampleValidFeatures);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }
}
