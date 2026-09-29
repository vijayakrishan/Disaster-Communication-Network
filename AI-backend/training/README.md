# RESQMESH AI Backend - Model & Training Documentation

This directory documents the connection between the machine learning training pipeline in `resqmesh-ai` and the standalone Spring Boot backend service.

---

## 1. Trained Model Artifacts
The backend loads model artifacts directly from `src/main/resources/model/` (or paths configured in `application.properties`):

- **`resqmesh_final_validated_model.json`**:
  Native XGBoost JSON model export trained on the 2021 Tamil Nadu statewide flood event using 52 physical + temporal features.
- **`resqmesh_final_validated_features.json`**:
  Strict JSON array of the 52 feature names in the exact order required by the model.
- **`resqmesh_final_validated_threshold.json`**:
  Contains the frozen decision threshold (`0.5000`) selected strictly on the 2021 internal development validation split.

---

## 2. How to Retrain the Model
To re-execute the training pipeline and generate fresh artifacts:

```bash
# Navigate to project root
cd ..

# Ensure python requirements are installed
pip install -r requirements.txt

# Run reproducible training script
python scripts/train_model.py
```

The script will:
1. Load `data/processed/temporal_weather_training_data.csv`.
2. Compute the 4 instantaneous engineered weather features.
3. Validate all 52 features.
4. Perform event-aware separation:
   - Train on 2021 event + 3x normal sample.
   - Internal 70/30 split to select optimal threshold on F1 score (`0.50`).
   - Retrain on 100% of 2021 dev set.
5. Evaluate on the unseen 2023 South Tamil Nadu flood event.
6. Export model, features, threshold, confusion matrix, and reports.

To update the backend with newly trained artifacts, copy them to `resqmesh-ai-backend/src/main/resources/model/`:
```powershell
Copy-Item models\resqmesh_final_validated_* resqmesh-ai-backend\src\main\resources\model\
```

---

## 3. Real XGBoost Inference in Java
The Java backend utilizes `ml.dmlc:xgboost4j_2.12:2.1.4` to load the native JSON booster and run inference in memory. No Python daemon or microservice bridge is required at runtime.
