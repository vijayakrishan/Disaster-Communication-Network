import pandas as pd
import numpy as np
import os

from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score
)

print("=" * 70)
print("RESQMESH - FEATURE GROUP COMPARISON")
print("=" * 70)

TRAIN_FILE = "data/processed/train_event_aware.csv"
TEST_FILE = "data/processed/test_event_aware.csv"

RANDOM_STATE = 42

# ================================================================
# FEATURE GROUPS
# ================================================================

WEATHER_FEATURES = [

    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "temperature_humidity_index"
]

RIVER_FEATURES = [

    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",
    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_7d_min",
    "discharge_30d_mean",
    "discharge_vs_7d_mean",
    "discharge_vs_30d_mean"
]

FEATURE_GROUPS = {

    "weather_only":
        WEATHER_FEATURES,

    "river_only":
        RIVER_FEATURES,

    "weather_plus_river":
        WEATHER_FEATURES + RIVER_FEATURES
}

# ================================================================
# LOAD DATA
# ================================================================

print("\nLoading data...")

train_df = pd.read_csv(
    TRAIN_FILE,
    low_memory=False
)

test_df = pd.read_csv(
    TEST_FILE,
    low_memory=False
)

y_train = train_df[
    "flood_event"
].astype(int)

y_test = test_df[
    "flood_event"
].astype(int)

print(
    f"Training rows: {len(train_df):,}"
)

print(
    f"Testing rows:  {len(test_df):,}"
)

# ================================================================
# CLASS WEIGHT
# ================================================================

normal_count = (
    y_train == 0
).sum()

flood_count = (
    y_train == 1
).sum()

scale_pos_weight = (
    normal_count /
    flood_count
)

print(
    f"\nscale_pos_weight: "
    f"{scale_pos_weight:.4f}"
)

# ================================================================
# RESULTS
# ================================================================

results = []

# ================================================================
# TRAIN EACH GROUP
# ================================================================

for group_name, features in FEATURE_GROUPS.items():

    print("\n")
    print("=" * 70)

    print(
        f"MODEL: {group_name.upper()}"
    )

    print("=" * 70)

    print(
        f"\nNumber of features: "
        f"{len(features)}"
    )

    print("\nFeatures:")

    for feature in features:
        print(
            f"  - {feature}"
        )

    # ------------------------------------------------------------
    # CHECK FEATURES
    # ------------------------------------------------------------

    missing_features = [
        feature
        for feature in features
        if feature not in train_df.columns
    ]

    if missing_features:

        print(
            "\nERROR: Missing features:"
        )

        for feature in missing_features:
            print(
                f"  - {feature}"
            )

        raise SystemExit(1)

    # ------------------------------------------------------------
    # PREPARE DATA
    # ------------------------------------------------------------

    X_train = train_df[
        features
    ].copy()

    X_test = test_df[
        features
    ].copy()

    for feature in features:

        X_train[feature] = pd.to_numeric(
            X_train[feature],
            errors="coerce"
        )

        X_test[feature] = pd.to_numeric(
            X_test[feature],
            errors="coerce"
        )

    X_train = X_train.replace(
        [np.inf, -np.inf],
        np.nan
    )

    X_test = X_test.replace(
        [np.inf, -np.inf],
        np.nan
    )

    # ------------------------------------------------------------
    # MISSING VALUE REPORT
    # ------------------------------------------------------------

    train_missing = (
        X_train.isna()
        .sum()
        .sum()
    )

    test_missing = (
        X_test.isna()
        .sum()
        .sum()
    )

    print(
        f"\nTraining missing cells: "
        f"{train_missing:,}"
    )

    print(
        f"Testing missing cells:  "
        f"{test_missing:,}"
    )

    # ------------------------------------------------------------
    # MODEL
    # ------------------------------------------------------------

    model = XGBClassifier(

        n_estimators=500,

        max_depth=5,

        learning_rate=0.03,

        subsample=0.85,

        colsample_bytree=0.85,

        min_child_weight=3,

        gamma=0.1,

        reg_alpha=0.1,

        reg_lambda=1.0,

        objective="binary:logistic",

        eval_metric="logloss",

        tree_method="hist",

        random_state=RANDOM_STATE,

        scale_pos_weight=scale_pos_weight,

        n_jobs=-1
    )

    print(
        "\nTraining..."
    )

    model.fit(
        X_train,
        y_train,
        verbose=False
    )

    # ------------------------------------------------------------
    # PREDICTIONS
    # ------------------------------------------------------------

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    predictions = (
        probabilities >= 0.50
    ).astype(int)

    # ------------------------------------------------------------
    # METRICS
    # ------------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    balanced_accuracy = (
        balanced_accuracy_score(
            y_test,
            predictions
        )
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    pr_auc = average_precision_score(
        y_test,
        probabilities
    )

    # ------------------------------------------------------------
    # RESULT
    # ------------------------------------------------------------

    print("\nRESULT")

    print(
        f"Accuracy: "
        f"{accuracy:.4f}"
    )

    print(
        f"Balanced Accuracy: "
        f"{balanced_accuracy:.4f}"
    )

    print(
        f"Precision: "
        f"{precision:.4f}"
    )

    print(
        f"Recall: "
        f"{recall:.4f}"
    )

    print(
        f"F1: "
        f"{f1:.4f}"
    )

    print(
        f"ROC-AUC: "
        f"{roc_auc:.4f}"
    )

    print(
        f"PR-AUC: "
        f"{pr_auc:.4f}"
    )

    # ------------------------------------------------------------
    # SAVE RESULT
    # ------------------------------------------------------------

    results.append({

        "model":
            group_name,

        "features":
            len(features),

        "accuracy":
            accuracy,

        "balanced_accuracy":
            balanced_accuracy,

        "precision":
            precision,

        "recall":
            recall,

        "f1":
            f1,

        "roc_auc":
            roc_auc,

        "pr_auc":
            pr_auc
    })

# ================================================================
# FINAL COMPARISON
# ================================================================

results_df = pd.DataFrame(
    results
)

print("\n")
print("=" * 70)
print("FINAL FEATURE GROUP COMPARISON")
print("=" * 70)

print(
    results_df.to_string(
        index=False
    )
)

# ================================================================
# SAVE
# ================================================================

OUTPUT_FILE = (
    "data/processed/"
    "feature_group_comparison.csv"
)

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print(
    f"\nSaved:"
)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)

print(
    "STEP 43 COMPLETE"
)

print("=" * 70)

print(
    "\nAll three models use the same:"
)

print(
    "- Training data"
)

print(
    "- Unseen test event"
)

print(
    "- XGBoost parameters"
)

print(
    "- Class weighting"
)

print(
    "\nThis makes the comparison fair."
)

print("=" * 70)