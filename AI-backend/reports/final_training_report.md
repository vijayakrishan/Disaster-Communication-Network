# RESQMESH AI - Final Validated Model Training & Evaluation Report

## 1. Executive Summary
- **Project**: RESQMESH (Emergency LoRa Mesh Communication Network & Decision Support)
- **Module**: AI Disaster Risk Estimation / Decision Support Module
- **Model Architecture**: Gradient Boosted Decision Trees (`XGBoostClassifier`)
- **Model Version**: `resqmesh-final-validated`
- **Trained Model File**: `models/resqmesh_final_validated_model.json`
- **Evaluation Protocol**: Event-Aware Separation (Trained on 2021 flood event, evaluated on unseen 2023 flood event)
- **Features Used**: Exactly **52** physical + temporal weather features.
- **Calendar Features**: **Excluded** (prevents artificial memorization of month/hour seasonal patterns).

---

## 2. Dataset & Event Methodology

| Split / Event | Event Period | Geographic Scope | Role in Pipeline | Samples |
|---|---|---|---|---|
| **Development Event** | 2021-11-06 to 2021-11-08 | Tamil Nadu Statewide | Training & Internal Threshold Selection (70/30 stratified split) | 10,944 (Flood: 2,736, Normal: 8,208) |
| **Unseen Test Event** | 2023-12-18 to 2023-12-20 | South TN (Thoothukudi, Tirunelveli, Kanyakumari, Tenkasi) | Final Out-of-Event Evaluation | 1,152 (Flood: 288, Normal: 864) |

> **Critical Note on Ground Truth Labels**:
> The 2021 flood event dataset uses a statewide event-period label. It does not imply that every square kilometer was flooded. The 2023 test set explicitly isolates the affected southern districts and treats non-affected cities during that window as uncertain (excluded from negative training) to maintain label integrity.

---

## 3. Final Model Evaluation Metrics (Unseen 2023 Event)

| Metric | Score | Percentage | Notes |
|---|---|---|---|
| **Accuracy** | `0.7543` | **75.43%** | Overall fraction of correct predictions |
| **Balanced Accuracy** | `0.5376` | **53.76%** | Macro average of recall per class (accounts for imbalance) |
| **Precision** | `0.5455` | **54.55%** | TP / (TP + FP) |
| **Recall (Sensitivity)** | `0.1042` | **10.42%** | TP / (TP + FN) |
| **F1-Score** | `0.1749` | **17.49%** | Harmonic mean of precision and recall |
| **ROC-AUC** | `0.9077` | **90.77%** | Area under the ROC curve across all discrimination thresholds |
| **PR-AUC** | `0.6388` | **63.88%** | Area under the Precision-Recall curve |

### Confusion Matrix
| Actual \ Predicted | Normal (Predicted 0) | Flood (Predicted 1) | Total |
|---|---|---|---|
| **Actual Normal** | **839** (TN) | **25** (FP) | 864 |
| **Actual Flood** | **258** (FN) | **30** (TP) | 288 |
| **Total** | 1097 | 55 | 1152 |

---

## 4. Hyperparameter Configuration
- `n_estimators`: 700
- `max_depth`: 5
- `learning_rate`: 0.03
- `subsample`: 0.85
- `colsample_bytree`: 0.85
- `min_child_weight`: 3
- `gamma`: 0.1
- `reg_alpha`: 0.1
- `reg_lambda`: 1.0
- `objective`: `binary:logistic`
- `eval_metric`: `logloss`
- `tree_method`: `hist`
- `scale_pos_weight`: 3
- `random_state`: 42

---

## 5. Top 15 Feature Importances

| Rank | Feature Name | Importance Score | Feature Group |
|---|---|---|---|
| 1 | `humidity_24h_mean` | `0.453390` | Temporal / Derived |
| 2 | `rain_48h` | `0.106664` | Temporal / Derived |
| 3 | `cloud_24h_mean` | `0.049716` | Temporal / Derived |
| 4 | `temperature_24h_mean` | `0.045215` | Temporal / Derived |
| 5 | `precip_48h` | `0.034777` | Temporal / Derived |
| 6 | `cloud_cover` | `0.027213` | Basic Weather |
| 7 | `cloud_12h_mean` | `0.016137` | Temporal / Derived |
| 8 | `temperature_24h_max` | `0.014180` | Temporal / Derived |
| 9 | `temperature_24h_min` | `0.013985` | Temporal / Derived |
| 10 | `wind_v` | `0.013496` | Engineered Weather |
| 11 | `wind_direction_10m` | `0.013462` | Basic Weather |
| 12 | `wind_speed_10m` | `0.012884` | Basic Weather |
| 13 | `pressure_change_24h` | `0.012310` | Temporal / Derived |
| 14 | `humidity_24h_max` | `0.011739` | Temporal / Derived |
| 15 | `cloud_6h_mean` | `0.011444` | Temporal / Derived |

---

## 6. Scientific Limitations & Operational Interpretation
1. **Decision Support, Not Guaranteed Disaster Occurrence**:
   The model produces a continuous risk score between 0.0 and 1.0 representing environmental and temporal pattern similarity to historical flood regimes. It must not be presented to emergency responders as an infallible alarm.
2. **Label Coarseness**:
   Statewide 2021 labels mean some local areas with moderate rain are marked as event period.
3. **Threshold Protocol**:
   The threshold `0.5000` was strictly tuned on the 2021 internal development validation split and frozen before evaluating on the 2023 event. No post-hoc threshold searching was performed on the test set.

---
*Report generated automatically by `scripts/train_model.py` on 2026-09-29 13:39:50.*
