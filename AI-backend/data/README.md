# RESQMESH AI Datasets Catalog

This directory contains meteorological catalogs, flood event registers, rainfall normals, and evaluation results utilized by the RESQMESH AI disaster risk estimation system.

---

## 1. Directory Structure

```
data/
├── raw/                                 # Raw reference datasets & catalogs
│   ├── district wise rainfall normal.csv
│   ├── Gov. Climate Datasets (Archive) - List.csv
│   └── Gov_Climate_Datasets_Archive.csv
│
└── processed/                           # Event-level catalogs, normals & evaluation outputs
    ├── tamil_nadu_flood_events.csv
    ├── tamil_nadu_district_rainfall_normals.csv
    ├── tamil_nadu_historical_rainfall_summary.csv
    ├── flood_weather_city_statistics.csv
    ├── flood_vs_normal_feature_analysis.csv
    ├── discharge_matching_validation_summary.csv
    ├── feature_group_comparison.csv
    ├── resqmesh_final_validation_results.csv
    ├── resqmesh_final_unseen_test_results.csv
    ├── resqmesh_no_calendar_results.csv
    ├── temporal_threshold_validation_results.csv
    ├── unseen_2023_threshold_diagnostic.csv
    └── *.json / *.csv                   # Metrics and feature importance tables
```

---

## 2. Large Training Datasets Note

The complete raw temporal dataset (`temporal_weather_training_data.csv` - ~1.88M rows, ~968MB) and large intermediate merged training files are excluded from git tracking to maintain repository performance and adhere to GitHub storage limits.

To regenerate or acquire the full training data:
1. Historical weather series can be fetched via the Open-Meteo Historical Weather API for Tamil Nadu coordinates (2021-2023).
2. River discharge records are sourced from the Central Water Commission (CWC), India.
3. Run the reproducible pipeline scripts in `training/` or execute `python scripts/train_model.py`.
