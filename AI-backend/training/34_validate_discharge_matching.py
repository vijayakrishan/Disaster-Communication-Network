import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - VALIDATE RIVER DISCHARGE MATCHING")
print("=" * 70)

INPUT_FILE = "data/processed/event_weather_discharge.csv"

if not os.path.exists(INPUT_FILE):
    print("\nERROR: File not found:")
    print(INPUT_FILE)
    raise SystemExit(1)

# ================================================================
# LOAD DATA
# ================================================================

print("\nLoading matched dataset...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(f"Total rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")

# ================================================================
# 1. BASIC DATASET INFORMATION
# ================================================================

print("\n" + "=" * 70)
print("1. BASIC DATASET INFORMATION")
print("=" * 70)

if "flood_event" in df.columns:

    print("\nFlood-event distribution:")
    print(
        df["flood_event"]
        .value_counts(dropna=False)
        .sort_index()
    )

if "event_id" in df.columns:

    print("\nEvent IDs:")

    event_summary = (
        df.groupby(
            ["event_id", "flood_event"],
            dropna=False
        )
        .size()
        .reset_index(name="rows")
    )

    print(
        event_summary.to_string(index=False)
    )

# ================================================================
# 2. DISCHARGE MATCH COVERAGE
# ================================================================

print("\n" + "=" * 70)
print("2. DISCHARGE MATCH COVERAGE")
print("=" * 70)

if "matched_station" not in df.columns:

    print("\nERROR: matched_station column not found.")
    print("\nAvailable columns:")
    print(df.columns.tolist())

    raise SystemExit(1)

matched_mask = df["matched_station"].notna()

rows_with_discharge = matched_mask.sum()
rows_without_discharge = (~matched_mask).sum()
match_rate = matched_mask.mean() * 100

print(
    f"\nRows WITH discharge:    "
    f"{rows_with_discharge:,}"
)

print(
    f"Rows WITHOUT discharge: "
    f"{rows_without_discharge:,}"
)

print(
    f"Match rate:             "
    f"{match_rate:.2f}%"
)

# ================================================================
# 3. FLOOD EVENT DISCHARGE COVERAGE
# ================================================================

print("\n" + "=" * 70)
print("3. FLOOD EVENT DISCHARGE COVERAGE")
print("=" * 70)

flood_event_coverage = np.nan

if "flood_event" in df.columns:

    flood_df = df[
        df["flood_event"] == 1
    ].copy()

    print(
        f"\nTotal flood-event rows: "
        f"{len(flood_df):,}"
    )

    if len(flood_df) > 0:

        flood_matched = (
            flood_df["matched_station"].notna()
        )

        flood_rows_with_discharge = (
            flood_matched.sum()
        )

        flood_rows_without_discharge = (
            (~flood_matched).sum()
        )

        flood_event_coverage = (
            flood_matched.mean() * 100
        )

        print(
            f"Flood rows WITH discharge:    "
            f"{flood_rows_with_discharge:,}"
        )

        print(
            f"Flood rows WITHOUT discharge: "
            f"{flood_rows_without_discharge:,}"
        )

        print(
            f"Flood discharge coverage:     "
            f"{flood_event_coverage:.2f}%"
        )

# ================================================================
# 4. STATION USAGE
# ================================================================

print("\n" + "=" * 70)
print("4. STATION USAGE")
print("=" * 70)

station_usage = (
    df[df["matched_station"].notna()]
    .groupby("matched_station")
    .size()
    .sort_values(ascending=False)
)

print(
    f"\nUnique matched stations: "
    f"{len(station_usage)}"
)

print("\nTop 20 most-used stations:")

print(
    station_usage
    .head(20)
    .to_string()
)

print("\nStations with very low usage (<100 rows):")

low_usage = station_usage[
    station_usage < 100
]

if len(low_usage) == 0:

    print("None")

else:

    print(
        low_usage.to_string()
    )

# ================================================================
# 5. STATION DISTANCE VALIDATION
# ================================================================

print("\n" + "=" * 70)
print("5. STATION DISTANCE VALIDATION")
print("=" * 70)

distance_stats = None
distance_over_50 = 0

if "station_distance_km" in df.columns:

    distance = (
        df.loc[
            matched_mask,
            "station_distance_km"
        ]
        .dropna()
    )

    if len(distance) > 0:

        print("\nDistance statistics:")

        print(
            distance.describe()
        )

        print("\nDistance categories:")

        categories = pd.cut(
            distance,
            bins=[
                -np.inf,
                10,
                20,
                30,
                50,
                np.inf
            ],
            labels=[
                "<=10 km",
                "10-20 km",
                "20-30 km",
                "30-50 km",
                ">50 km"
            ]
        )

        distance_counts = (
            categories
            .value_counts()
            .sort_index()
        )

        distance_percent = (
            distance_counts /
            len(distance) *
            100
        ).round(2)

        distance_table = pd.DataFrame({
            "rows": distance_counts,
            "percentage": distance_percent
        })

        print(
            distance_table.to_string()
        )

        # --------------------------------------------------------
        # >50 KM
        # --------------------------------------------------------

        far_rows = df[
            df["station_distance_km"].notna()
            &
            (
                df["station_distance_km"] > 50
            )
        ]

        distance_over_50 = len(far_rows)

        print(
            f"\nRows with station distance > 50 km: "
            f"{len(far_rows):,}"
        )

        if len(far_rows) > 0:

            display_columns = [
                "city_normalized",
                "matched_station",
                "station_distance_km"
            ]

            optional_columns = [
                "matched_station_district",
                "matched_station_river",
                "matched_station_basin"
            ]

            for column in optional_columns:

                if column in far_rows.columns:
                    display_columns.append(column)

            display_columns = [
                c for c in display_columns
                if c in far_rows.columns
            ]

            print(
                "\nFarthest city-station matches:"
            )

            print(
                far_rows[
                    display_columns
                ]
                .drop_duplicates()
                .sort_values(
                    "station_distance_km",
                    ascending=False
                )
                .head(30)
                .to_string(index=False)
            )

# ================================================================
# 6. FLOOD EVENT STATION MATCHING
# ================================================================

print("\n" + "=" * 70)
print("6. FLOOD-EVENT STATION MATCHING")
print("=" * 70)

if "flood_event" in df.columns:

    flood_matched_df = df[
        (df["flood_event"] == 1)
        &
        df["matched_station"].notna()
    ].copy()

    print(
        f"\nFlood-event rows with discharge: "
        f"{len(flood_matched_df):,}"
    )

    if len(flood_matched_df) > 0:

        # Only use columns guaranteed by Step 33.
        grouping_columns = [
            "event_id",
            "city_normalized",
            "matched_station"
        ]

        grouping_columns = [
            c for c in grouping_columns
            if c in flood_matched_df.columns
        ]

        aggregation = {
            "matched_station": "size"
        }

        if "station_distance_km" in flood_matched_df.columns:

            aggregation[
                "station_distance_km"
            ] = "first"

        event_station_summary = (
            flood_matched_df
            .groupby(
                grouping_columns,
                dropna=False
            )
            .agg(
                rows=(
                    "matched_station",
                    "size"
                ),
                distance_km=(
                    "station_distance_km",
                    "first"
                )
                if "station_distance_km"
                in flood_matched_df.columns
                else (
                    "matched_station",
                    "size"
                )
            )
            .reset_index()
        )

        if "distance_km" in event_station_summary.columns:

            event_station_summary = (
                event_station_summary
                .sort_values(
                    [
                        "event_id",
                        "city_normalized"
                    ]
                )
            )

        print(
            "\nFlood-event city -> station mapping:"
        )

        print(
            event_station_summary
            .to_string(index=False)
        )

# ================================================================
# 7. DISCHARGE DATE COVERAGE
# ================================================================

print("\n" + "=" * 70)
print("7. DISCHARGE DATE COVERAGE")
print("=" * 70)

matched_df = df[
    df["matched_station"].notna()
].copy()

date_columns = [
    "weather_date",
    "date",
    "Data Acquisition Time",
    "data_date"
]

found_date_column = None

for column in date_columns:

    if column in matched_df.columns:

        found_date_column = column
        break

if found_date_column is not None:

    dates = pd.to_datetime(
        matched_df[found_date_column],
        errors="coerce"
    )

    print(
        f"\nDate column used: "
        f"{found_date_column}"
    )

    print(
        f"Minimum date: "
        f"{dates.min()}"
    )

    print(
        f"Maximum date: "
        f"{dates.max()}"
    )

else:

    print(
        "\nNo recognized date column found."
    )

# ================================================================
# 8. DISCHARGE FEATURE MISSINGNESS
# ================================================================

print("\n" + "=" * 70)
print("8. DISCHARGE FEATURE MISSINGNESS")
print("=" * 70)

discharge_columns = [
    column
    for column in df.columns
    if "discharge" in column.lower()
]

if len(discharge_columns) == 0:

    print(
        "\nNo columns containing 'discharge' found."
    )

else:

    print(
        "\nDischarge-related columns:"
    )

    for column in discharge_columns:

        missing = df[column].isna().sum()

        percentage = (
            missing /
            len(df) *
            100
        )

        print(
            f"{column:45s} "
            f"missing={missing:10,} "
            f"({percentage:6.2f}%)"
        )

# ================================================================
# 9. FLOOD VS NORMAL DISCHARGE
# ================================================================

print("\n" + "=" * 70)
print("9. FLOOD VS NORMAL DISCHARGE SUMMARY")
print("=" * 70)

# Find the actual current discharge column automatically.
possible_discharge_columns = [
    column
    for column in df.columns
    if (
        "discharge" in column.lower()
        and (
            "lag" not in column.lower()
            and "change" not in column.lower()
            and "mean" not in column.lower()
            and "max" not in column.lower()
            and "min" not in column.lower()
        )
    )
]

if len(possible_discharge_columns) > 0:

    discharge_column = possible_discharge_columns[0]

    print(
        f"\nUsing discharge column: "
        f"{discharge_column}"
    )

    valid_discharge = df[
        df[discharge_column].notna()
    ].copy()

    if "flood_event" in valid_discharge.columns:

        summary = (
            valid_discharge
            .groupby("flood_event")[
                discharge_column
            ]
            .agg(
                count="count",
                mean="mean",
                median="median",
                max="max"
            )
        )

        print("\nDischarge statistics:")

        print(
            summary.to_string()
        )

    else:

        print(
            "\nflood_event column not found."
        )

else:

    print(
        "\nCould not automatically identify "
        "the current discharge column."
    )

    print(
        "\nAvailable discharge-related columns:"
    )

    print(
        discharge_columns
    )

# ================================================================
# 10. VALIDATION SUMMARY
# ================================================================

print("\n" + "=" * 70)
print("10. VALIDATION SUMMARY")
print("=" * 70)

summary_rows = []

summary_rows.append({
    "metric": "total_rows",
    "value": len(df)
})

summary_rows.append({
    "metric": "rows_with_discharge",
    "value": rows_with_discharge
})

summary_rows.append({
    "metric": "rows_without_discharge",
    "value": rows_without_discharge
})

summary_rows.append({
    "metric": "discharge_match_rate_percent",
    "value": round(
        match_rate,
        2
    )
})

if not pd.isna(flood_event_coverage):

    summary_rows.append({
        "metric":
            "flood_event_discharge_coverage_percent",
        "value":
            round(
                flood_event_coverage,
                2
            )
    })

if "station_distance_km" in df.columns:

    valid_distance = (
        df["station_distance_km"]
        .dropna()
    )

    if len(valid_distance) > 0:

        summary_rows.append({
            "metric":
                "mean_station_distance_km",
            "value":
                round(
                    valid_distance.mean(),
                    2
                )
        })

        summary_rows.append({
            "metric":
                "median_station_distance_km",
            "value":
                round(
                    valid_distance.median(),
                    2
                )
        })

        summary_rows.append({
            "metric":
                "max_station_distance_km",
            "value":
                round(
                    valid_distance.max(),
                    2
                )
        })

        summary_rows.append({
            "metric":
                "rows_over_50km",
            "value":
                distance_over_50
        })

summary_rows.append({
    "metric":
        "unique_matched_stations",
    "value":
        len(station_usage)
})

validation_summary = pd.DataFrame(
    summary_rows
)

OUTPUT_FILE = (
    "data/processed/"
    "discharge_matching_validation_summary.csv"
)

validation_summary.to_csv(
    OUTPUT_FILE,
    index=False
)

print(
    "\nValidation summary saved:"
)

print(
    OUTPUT_FILE
)

# ================================================================
# FINAL
# ================================================================

print("\n" + "=" * 70)
print("STEP 34 COMPLETE")
print("=" * 70)

print("\nValidation finished successfully.")
print(
    "Do NOT train the model yet; "
    "review the validation output first."
)