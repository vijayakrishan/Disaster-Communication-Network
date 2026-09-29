# RESQMESH AI Reports Directory

This directory contains the reproducible validation and evaluation artifacts for the RESQMESH AI risk estimation model:

- **`final_training_report.md`**: Complete human-readable evaluation report covering dataset methodology, event separation, hyperparameters, evaluation metrics, confusion matrix, top feature importances, and scientific limitations.
- **`final_metrics.json`**: Machine-readable JSON summary of all validation and unseen test metrics.
- **`confusion_matrix.csv`**: Unseen 2023 test confusion matrix breakdown (TN, FP, FN, TP).
- **`feature_importance.csv`**: Complete importance ranking of all 52 features.

To reproduce this report, run:
```bash
python scripts/train_model.py
```
