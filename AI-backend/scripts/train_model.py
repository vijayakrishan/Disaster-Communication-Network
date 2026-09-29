import os
import sys
import time
import json
from pathlib import Path
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)

# ==============================================================================
# RESQMESH - REPRODUCIBLE MODEL TRAINING & VALIDATION PIPELINE
# ==============================================================================
# Model: Physical + Temporal XGBoost (No Calendar Features)
# Development Event: 2021 Tamil Nadu statewide flood event
# Unseen Test Event: 2023 South Tamil Nadu flood event
# ==============================================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = BASE_DIR / "data" / "processed" / "temporal_weather_training_data.csv"
MODEL_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

MODEL_OUTPUT = MODEL_DIR / "resqmesh_final_validated_model.json"
FEATURE_OUTPUT = MODEL_DIR / "resqmesh_final_validated_features.json"
THRESHOLD_OUTPUT = MODEL_DIR / "resqmesh_final_validated_threshold.json"

REPORT_MD_OUTPUT = REPORTS_DIR / "final_training_report.md"
METRICS_JSON_OUTPUT = REPORTS_DIR / "final_metrics.json"
CONFUSION_MATRIX_OUTPUT = REPORTS_DIR / "confusion_matrix.csv"
FEATURE_IMPORTANCE_OUTPUT = REPORTS_DIR / "feature_importance.csv"
REPORTS_README_OUTPUT = REPORTS_DIR / "README.md"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Exact 52 physical + temporal features
FEATURES = [
    # Basic weather
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "wind_direction_10m",

    # Engineered weather
    "rain_binary",
    "temperature_humidity_index",
    "wind_u",
    "wind_v",

    # Rain accumulation
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",

    # Precipitation accumulation
    "precip_3h",
    "precip_6h",
    "precip_12h",
    "precip_24h",
    "precip_48h",

    # Rain intensity / maxima
    "rain_3h_max",
    "rain_6h_max",
    "rain_12h_max",
    "rain_24h_max",

    # Humidity temporal features
    "humidity_6h_mean",
    "humidity_12h_mean",
    "humidity_24h_mean",
    "humidity_24h_max",

    # Temperature temporal features
    "temperature_6h_mean",
    "temperature_24h_mean",
    "temperature_24h_min",
    "temperature_24h_max",

    # Cloud temporal features
    "cloud_6h_mean",
    "cloud_12h_mean",
    "cloud_24h_mean",

    # Pressure changes
    "pressure_change_3h",
    "pressure_change_6h",
    "pressure_change_12h",
    "pressure_change_24h",

    # Rain changes
    "rain_change_1h",
    "rain_change_3h",
    "rain_change_6h",

    # Rain risk indicators
    "is_heavy_rain_3h",
    "is_heavy_rain_6h",
    "is_heavy_rain_24h",
    "is_extreme_rain_24h",

    "rain_acceleration",
    "humidity_pressure_risk"
]


def train():
    start_time = time.time()
    print("=" * 80)
    print("RESQMESH - REPRODUCIBLE TRAINING & EVALUATION PIPELINE")
    print("=" * 80)

    # 1. Load Data
    print(f"\n[1/8] Loading dataset from: {INPUT_FILE}")
    if not INPUT_FILE.exists():
        print(f"ERROR: Dataset not found at {INPUT_FILE}")
        sys.exit(1)

    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df):,} rows, {len(df.columns)} columns.")

    # 2. Engineer Instantaneous Weather Features
    print("\n[2/8] Creating physical engineered features (rain_binary, THI, wind_u, wind_v)...")
    df["rain_binary"] = (df["rain"] > 0).astype(int)
    df["temperature_humidity_index"] = df["temperature_2m"] * (df["relative_humidity_2m"] / 100.0)
    direction_rad = np.deg2rad(df["wind_direction_10m"])
    df["wind_u"] = -df["wind_speed_10m"] * np.sin(direction_rad)
    df["wind_v"] = -df["wind_speed_10m"] * np.cos(direction_rad)

    # Verify features
    missing_feats = [f for f in FEATURES if f not in df.columns]
    if missing_feats:
        print(f"ERROR: Missing expected features: {missing_feats}")
        sys.exit(1)
    print(f"Validated all {len(FEATURES)} features present.")

    # 3. Separate Events
    print("\n[3/8] Splitting events (Event 1: 2021 Dev, Event 2: 2023 Unseen Test, Normal: 0)...")
    event_1 = df[df["event_id"] == 1].copy()
    event_2 = df[df["event_id"] == 2].copy()
    normal = df[df["event_id"] == 0].copy()

    print(f"  2021 flood rows : {len(event_1):,}")
    print(f"  2023 flood rows : {len(event_2):,}")
    print(f"  Normal rows     : {len(normal):,}")

    # 4. Build Development Data (2021 Flood + 3x Normal Sample)
    print("\n[4/8] Building 2021 development set (ratio 1:3 positive to negative)...")
    development_flood = event_1.copy()
    development_normal = normal.sample(n=len(development_flood) * 3, random_state=42)
    development = pd.concat([development_flood, development_normal], ignore_index=True)
    development = development.sample(frac=1, random_state=42).reset_index(drop=True)

    # Internal Dev Train / Validation Split (70% train, 30% val)
    dev_train, dev_val = train_test_split(
        development,
        test_size=0.30,
        random_state=42,
        stratify=development["flood_event"]
    )
    print(f"  Dev Training rows   : {len(dev_train):,}")
    print(f"  Dev Validation rows : {len(dev_val):,}")

    X_dev_train = dev_train[FEATURES].copy().replace([np.inf, -np.inf], np.nan)
    y_dev_train = dev_train["flood_event"].astype(int)

    X_dev_val = dev_val[FEATURES].copy().replace([np.inf, -np.inf], np.nan)
    y_dev_val = dev_val["flood_event"].astype(int)

    # Fill NaNs with training medians
    training_medians = X_dev_train.median()
    X_dev_train = X_dev_train.fillna(training_medians)
    X_dev_val = X_dev_val.fillna(training_medians)

    # 5. Train Validation Model & Select Threshold
    print("\n[5/8] Training validation model on 70% dev set to select frozen threshold...")
    xgb_params = {
        "n_estimators": 700,
        "max_depth": 5,
        "learning_rate": 0.03,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "min_child_weight": 3,
        "gamma": 0.1,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "tree_method": "hist",
        "random_state": 42,
        "n_jobs": -1,
        "scale_pos_weight": 3
    }

    val_model = xgb.XGBClassifier(**xgb_params)
    val_model.fit(X_dev_train, y_dev_train)

    val_probs = val_model.predict_proba(X_dev_val)[:, 1]
    val_roc_auc = roc_auc_score(y_dev_val, val_probs)
    val_pr_auc = average_precision_score(y_dev_val, val_probs)

    threshold_candidates = [
        0.00001, 0.00002, 0.00005, 0.00010, 0.00020, 0.00030, 0.00050, 0.00075,
        0.00100, 0.00200, 0.00300, 0.00500, 0.01000, 0.02000, 0.05000, 0.10000,
        0.20000, 0.50000
    ]

    thresh_results = []
    for th in threshold_candidates:
        preds = (val_probs >= th).astype(int)
        acc = accuracy_score(y_dev_val, preds)
        bacc = balanced_accuracy_score(y_dev_val, preds)
        prec = precision_score(y_dev_val, preds, zero_division=0)
        rec = recall_score(y_dev_val, preds, zero_division=0)
        f1 = f1_score(y_dev_val, preds, zero_division=0)
        thresh_results.append({
            "threshold": th, "accuracy": acc, "balanced_accuracy": bacc,
            "precision": prec, "recall": rec, "f1": f1
        })

    thresh_df = pd.DataFrame(thresh_results).sort_values(
        ["f1", "balanced_accuracy"], ascending=False
    ).reset_index(drop=True)

    selected_threshold = float(thresh_df.iloc[0]["threshold"])
    val_f1_selected = float(thresh_df.iloc[0]["f1"])
    val_bacc_selected = float(thresh_df.iloc[0]["balanced_accuracy"])
    val_rec_selected = float(thresh_df.iloc[0]["recall"])
    val_prec_selected = float(thresh_df.iloc[0]["precision"])

    print(f"  Selected Frozen Threshold (max dev F1): {selected_threshold:.6f}")
    print(f"  Validation F1: {val_f1_selected:.4f}, Balanced Acc: {val_bacc_selected:.4f}")
    print(f"  Validation ROC-AUC: {val_roc_auc:.4f}, PR-AUC: {val_pr_auc:.4f}")

    # 6. Final Model Training on ALL 2021 Development Data
    print("\n[6/8] Retraining final model on 100% of 2021 development data...")
    X_final_train = development[FEATURES].copy().replace([np.inf, -np.inf], np.nan)
    y_final_train = development["flood_event"].astype(int)
    final_training_medians = X_final_train.median()
    X_final_train = X_final_train.fillna(final_training_medians)

    final_model = xgb.XGBClassifier(**xgb_params)
    final_model.fit(X_final_train, y_final_train)
    print("  Final model training complete.")

    # 7. Unseen Test Evaluation (2023 South TN Flood Event)
    print("\n[7/8] Evaluating frozen model on completely unseen 2023 test event...")
    test_flood = event_2.copy()
    test_normal = normal.sample(n=len(test_flood) * 3, random_state=123)
    final_test = pd.concat([test_flood, test_normal], ignore_index=True)
    final_test = final_test.sample(frac=1, random_state=123).reset_index(drop=True)

    X_final_test = final_test[FEATURES].copy().replace([np.inf, -np.inf], np.nan)
    y_final_test = final_test["flood_event"].astype(int)
    X_final_test = X_final_test.fillna(final_training_medians)

    final_probs = final_model.predict_proba(X_final_test)[:, 1]
    final_preds = (final_probs >= selected_threshold).astype(int)

    final_acc = accuracy_score(y_final_test, final_preds)
    final_bacc = balanced_accuracy_score(y_final_test, final_preds)
    final_prec = precision_score(y_final_test, final_preds, zero_division=0)
    final_rec = recall_score(y_final_test, final_preds, zero_division=0)
    final_f1 = f1_score(y_final_test, final_preds, zero_division=0)
    final_roc_auc = roc_auc_score(y_final_test, final_probs)
    final_pr_auc = average_precision_score(y_final_test, final_probs)
    cm = confusion_matrix(y_final_test, final_preds)

    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    print("\n" + "=" * 80)
    print("FINAL UNSEEN TEST EVALUATION METRICS (2023 EVENT)")
    print("=" * 80)
    print(f"Accuracy          : {final_acc:.4f} ({final_acc * 100:.2f}%)")
    print(f"Balanced Accuracy : {final_bacc:.4f} ({final_bacc * 100:.2f}%)")
    print(f"Precision         : {final_prec:.4f} ({final_prec * 100:.2f}%)")
    print(f"Recall            : {final_rec:.4f} ({final_rec * 100:.2f}%)")
    print(f"F1 Score          : {final_f1:.4f} ({final_f1 * 100:.2f}%)")
    print(f"ROC-AUC           : {final_roc_auc:.4f}")
    print(f"PR-AUC            : {final_pr_auc:.4f}")
    print(f"Confusion Matrix  : TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print("=" * 80)

    # 8. Save Artifacts & Reports
    print("\n[8/8] Saving model artifacts and reports...")

    # Save model
    final_model.save_model(str(MODEL_OUTPUT))
    print(f"  Saved model: {MODEL_OUTPUT}")

    # Save features
    with open(FEATURE_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(FEATURES, f, indent=2)
    print(f"  Saved feature list: {FEATURE_OUTPUT}")

    # Save threshold
    threshold_meta = {
        "selected_threshold": selected_threshold,
        "selection_method": "Maximum validation F1; balanced accuracy used as tie-breaker",
        "threshold_selection_event": "2021",
        "final_test_event": "2023",
        "calendar_features_used": False,
        "demonstration_thresholds": {
            "SAFE": [0.0, 0.35],
            "WARNING": [0.35, 0.50],
            "DANGER": [0.50, 1.0]
        }
    }
    with open(THRESHOLD_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(threshold_meta, f, indent=2)
    print(f"  Saved threshold info: {THRESHOLD_OUTPUT}")

    # Save metrics JSON
    metrics_data = {
        "model_name": "ResQMesh No-Calendar Temporal XGBoost",
        "model_version": "resqmesh-final-validated",
        "training_event": "2021 Tamil Nadu Flood (statewide label)",
        "unseen_test_event": "2023 South Tamil Nadu Flood (Thoothukudi, Tirunelveli, Kanyakumari, Tenkasi)",
        "feature_count": len(FEATURES),
        "selected_threshold": selected_threshold,
        "metrics": {
            "accuracy": final_acc,
            "balanced_accuracy": final_bacc,
            "precision": final_prec,
            "recall": final_rec,
            "f1_score": final_f1,
            "roc_auc": final_roc_auc,
            "pr_auc": final_pr_auc
        },
        "confusion_matrix": {
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn,
            "true_positive": tp,
            "total_test_samples": tn + fp + fn + tp
        },
        "validation_tuning": {
            "val_f1": val_f1_selected,
            "val_balanced_accuracy": val_bacc_selected,
            "val_roc_auc": val_roc_auc,
            "val_pr_auc": val_pr_auc
        }
    }
    with open(METRICS_JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"  Saved metrics: {METRICS_JSON_OUTPUT}")

    # Save confusion matrix CSV
    cm_df = pd.DataFrame([
        {"actual": "Normal", "predicted_normal": tn, "predicted_flood": fp},
        {"actual": "Flood", "predicted_normal": fn, "predicted_flood": tp}
    ])
    cm_df.to_csv(CONFUSION_MATRIX_OUTPUT, index=False)
    print(f"  Saved confusion matrix: {CONFUSION_MATRIX_OUTPUT}")

    # Save feature importance
    importance_df = pd.DataFrame({
        "feature": FEATURES,
        "importance": final_model.feature_importances_
    }).sort_values("importance", ascending=False).reset_index(drop=True)
    importance_df.to_csv(FEATURE_IMPORTANCE_OUTPUT, index=False)
    print(f"  Saved feature importance: {FEATURE_IMPORTANCE_OUTPUT}")

    # Generate Markdown Report
    top_15_feats = importance_df.head(15)
    report_md = f"""# RESQMESH AI - Final Validated Model Training & Evaluation Report

## 1. Executive Summary
- **Project**: RESQMESH (Emergency LoRa Mesh Communication Network & Decision Support)
- **Module**: AI Disaster Risk Estimation / Decision Support Module
- **Model Architecture**: Gradient Boosted Decision Trees (`XGBoostClassifier`)
- **Model Version**: `resqmesh-final-validated`
- **Trained Model File**: `models/resqmesh_final_validated_model.json`
- **Evaluation Protocol**: Event-Aware Separation (Trained on 2021 flood event, evaluated on unseen 2023 flood event)
- **Features Used**: Exactly **{len(FEATURES)}** physical + temporal weather features.
- **Calendar Features**: **Excluded** (prevents artificial memorization of month/hour seasonal patterns).

---

## 2. Dataset & Event Methodology

| Split / Event | Event Period | Geographic Scope | Role in Pipeline | Samples |
|---|---|---|---|---|
| **Development Event** | 2021-11-06 to 2021-11-08 | Tamil Nadu Statewide | Training & Internal Threshold Selection (70/30 stratified split) | {len(development):,} (Flood: {len(development_flood):,}, Normal: {len(development_normal):,}) |
| **Unseen Test Event** | 2023-12-18 to 2023-12-20 | South TN (Thoothukudi, Tirunelveli, Kanyakumari, Tenkasi) | Final Out-of-Event Evaluation | {len(final_test):,} (Flood: {len(test_flood):,}, Normal: {len(test_normal):,}) |

> **Critical Note on Ground Truth Labels**:
> The 2021 flood event dataset uses a statewide event-period label. It does not imply that every square kilometer was flooded. The 2023 test set explicitly isolates the affected southern districts and treats non-affected cities during that window as uncertain (excluded from negative training) to maintain label integrity.

---

## 3. Final Model Evaluation Metrics (Unseen 2023 Event)

| Metric | Score | Percentage | Notes |
|---|---|---|---|
| **Accuracy** | `{final_acc:.4f}` | **{final_acc * 100:.2f}%** | Overall fraction of correct predictions |
| **Balanced Accuracy** | `{final_bacc:.4f}` | **{final_bacc * 100:.2f}%** | Macro average of recall per class (accounts for imbalance) |
| **Precision** | `{final_prec:.4f}` | **{final_prec * 100:.2f}%** | TP / (TP + FP) |
| **Recall (Sensitivity)** | `{final_rec:.4f}` | **{final_rec * 100:.2f}%** | TP / (TP + FN) |
| **F1-Score** | `{final_f1:.4f}` | **{final_f1 * 100:.2f}%** | Harmonic mean of precision and recall |
| **ROC-AUC** | `{final_roc_auc:.4f}` | **{final_roc_auc * 100:.2f}%** | Area under the ROC curve across all discrimination thresholds |
| **PR-AUC** | `{final_pr_auc:.4f}` | **{final_pr_auc * 100:.2f}%** | Area under the Precision-Recall curve |

### Confusion Matrix
| Actual \\ Predicted | Normal (Predicted 0) | Flood (Predicted 1) | Total |
|---|---|---|---|
| **Actual Normal** | **{tn}** (TN) | **{fp}** (FP) | {tn + fp} |
| **Actual Flood** | **{fn}** (FN) | **{tp}** (TP) | {fn + tp} |
| **Total** | {tn + fn} | {fp + tp} | {tn + fp + fn + tp} |

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
"""
    for idx, r in top_15_feats.iterrows():
        feat = r["feature"]
        imp = r["importance"]
        grp = "Basic Weather" if feat in FEATURES[:10] else ("Engineered Weather" if feat in FEATURES[10:14] else "Temporal / Derived")
        report_md += f"| {idx + 1} | `{feat}` | `{imp:.6f}` | {grp} |\n"

    report_md += f"""
---

## 6. Scientific Limitations & Operational Interpretation
1. **Decision Support, Not Guaranteed Disaster Occurrence**:
   The model produces a continuous risk score between 0.0 and 1.0 representing environmental and temporal pattern similarity to historical flood regimes. It must not be presented to emergency responders as an infallible alarm.
2. **Label Coarseness**:
   Statewide 2021 labels mean some local areas with moderate rain are marked as event period.
3. **Threshold Protocol**:
   The threshold `{selected_threshold:.4f}` was strictly tuned on the 2021 internal development validation split and frozen before evaluating on the 2023 event. No post-hoc threshold searching was performed on the test set.

---
*Report generated automatically by `scripts/train_model.py` on {time.strftime('%Y-%m-%d %H:%M:%S')}.*
"""

    with open(REPORT_MD_OUTPUT, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"  Saved markdown report: {REPORT_MD_OUTPUT}")

    # Save reports/README.md
    reports_readme = f"""# RESQMESH AI Reports Directory

This directory contains the reproducible validation and evaluation artifacts for the RESQMESH AI risk estimation model:

- **`final_training_report.md`**: Complete human-readable evaluation report covering dataset methodology, event separation, hyperparameters, evaluation metrics, confusion matrix, top feature importances, and scientific limitations.
- **`final_metrics.json`**: Machine-readable JSON summary of all validation and unseen test metrics.
- **`confusion_matrix.csv`**: Unseen 2023 test confusion matrix breakdown (TN, FP, FN, TP).
- **`feature_importance.csv`**: Complete importance ranking of all 52 features.

To reproduce this report, run:
```bash
python scripts/train_model.py
```
"""
    with open(REPORTS_README_OUTPUT, "w", encoding="utf-8") as f:
        f.write(reports_readme)
    print(f"  Saved reports README: {REPORTS_README_OUTPUT}")

    print("\n" + "=" * 80)
    print(f"TRAINING PIPELINE COMPLETE in {time.time() - start_time:.2f} seconds.")
    print("=" * 80)


if __name__ == "__main__":
    train()
