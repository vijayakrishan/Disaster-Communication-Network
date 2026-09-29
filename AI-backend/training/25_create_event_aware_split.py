import pandas as pd
from pathlib import Path

print("=" * 70)
print("RESQMESH - CREATE EVENT-AWARE TRAIN / TEST SPLIT")
print("=" * 70)

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------
INPUT = Path("data/processed/event_training_dataset.csv")

TRAIN_OUTPUT = Path(
    "data/processed/event_aware_train.csv"
)

TEST_OUTPUT = Path(
    "data/processed/event_aware_test.csv"
)

# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------
print("\nLoading engineered dataset...")

df = pd.read_csv(
    INPUT,
    parse_dates=["time"]
)

print(f"Total rows: {len(df):,}")

# ---------------------------------------------------------
# FLOOD EVENTS
# ---------------------------------------------------------
print("\nFlood events available:")

flood_events = (
    df[df["flood_event"] == 1]
    .groupby("event_id")
    .agg(
        rows=("flood_event", "size"),
        start=("time", "min"),
        end=("time", "max")
    )
)

print(flood_events)

# ---------------------------------------------------------
# IDENTIFY EVENTS
# ---------------------------------------------------------
event_2021 = df[
    df["event_id"] == 1
].copy()

event_2023 = df[
    df["event_id"] == 2
].copy()

print("\n2021 event rows:", len(event_2021))
print("2023 event rows:", len(event_2023))

# ---------------------------------------------------------
# NORMAL DATA
# ---------------------------------------------------------
normal = df[
    df["flood_event"] == 0
].copy()

print("\nNormal weather rows:", len(normal))

# ---------------------------------------------------------
# CREATE NEGATIVE SAMPLES
# ---------------------------------------------------------
# We need normal-weather observations for both training
# and testing.
#
# To avoid using the same normal observation twice,
# split normal observations chronologically.
# ---------------------------------------------------------

normal = normal.sort_values("time")

normal_split_time = normal["time"].quantile(0.80)

normal_train = normal[
    normal["time"] <= normal_split_time
].copy()

normal_test = normal[
    normal["time"] > normal_split_time
].copy()

print("\nNormal-data split:")
print("Normal training:", len(normal_train))
print("Normal testing :", len(normal_test))
print("Normal split   :", normal_split_time)

# ---------------------------------------------------------
# IMPORTANT:
# USE 2021 EVENT FOR TRAINING
# USE 2023 EVENT FOR TESTING
# ---------------------------------------------------------

train_flood = event_2021.copy()
test_flood = event_2023.copy()

# ---------------------------------------------------------
# BALANCE THE NEGATIVE CLASS
# ---------------------------------------------------------
# There are millions of normal observations but only
# hundreds/thousands of flood observations.
#
# We take a manageable number of normal observations.
#
# The negative-to-positive ratio is 3:1.
# ---------------------------------------------------------

train_negative_count = len(train_flood) * 3
test_negative_count = len(test_flood) * 3

# Make sure we don't request more rows than available.
train_negative_count = min(
    train_negative_count,
    len(normal_train)
)

test_negative_count = min(
    test_negative_count,
    len(normal_test)
)

print("\nNegative samples selected:")
print("Training negatives:", train_negative_count)
print("Testing negatives :", test_negative_count)

# Use a fixed random seed for reproducibility.
train_negative = normal_train.sample(
    n=train_negative_count,
    random_state=42
)

test_negative = normal_test.sample(
    n=test_negative_count,
    random_state=42
)

# ---------------------------------------------------------
# COMBINE TRAINING DATA
# ---------------------------------------------------------
train_df = pd.concat(
    [train_flood, train_negative],
    ignore_index=True
)

test_df = pd.concat(
    [test_flood, test_negative],
    ignore_index=True
)

# Shuffle rows AFTER separating train/test.
train_df = train_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

test_df = test_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

# ---------------------------------------------------------
# REMOVE UNNECESSARY EVENT INFORMATION FROM FEATURES
# ---------------------------------------------------------
# event_id is metadata identifying the known event.
# It must NOT be given to the model.
#
# We keep it in the dataset for analysis, but it will be
# excluded later during model training.
# ---------------------------------------------------------

# ---------------------------------------------------------
# TRAIN DISTRIBUTION
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("TRAINING DATA")
print("=" * 70)

print("Rows:", len(train_df))

print("\nLabel distribution:")
print(train_df["flood_event"].value_counts())

print("\nEvent distribution:")
print(train_df["event_id"].value_counts().sort_index())

# ---------------------------------------------------------
# TEST DISTRIBUTION
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("TESTING DATA")
print("=" * 70)

print("Rows:", len(test_df))

print("\nLabel distribution:")
print(test_df["flood_event"].value_counts())

print("\nEvent distribution:")
print(test_df["event_id"].value_counts().sort_index())

# ---------------------------------------------------------
# POSITIVE / NEGATIVE RATIO
# ---------------------------------------------------------
train_pos = (train_df["flood_event"] == 1).sum()
train_neg = (train_df["flood_event"] == 0).sum()

test_pos = (test_df["flood_event"] == 1).sum()
test_neg = (test_df["flood_event"] == 0).sum()

print("\n" + "=" * 70)
print("CLASS RATIOS")
print("=" * 70)

print(
    f"Training: {train_pos} positive / "
    f"{train_neg} negative"
)

print(
    f"Testing : {test_pos} positive / "
    f"{test_neg} negative"
)

print(
    f"\nTraining positive percentage: "
    f"{train_pos / len(train_df) * 100:.2f}%"
)

print(
    f"Testing positive percentage: "
    f"{test_pos / len(test_df) * 100:.2f}%"
)

# ---------------------------------------------------------
# TIME RANGES
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("TIME RANGES")
print("=" * 70)

print(
    f"\nTraining time range:\n"
    f"{train_df['time'].min()} → "
    f"{train_df['time'].max()}"
)

print(
    f"\nTesting time range:\n"
    f"{test_df['time'].min()} → "
    f"{test_df['time'].max()}"
)

# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------
train_df.to_csv(
    TRAIN_OUTPUT,
    index=False
)

test_df.to_csv(
    TEST_OUTPUT,
    index=False
)

print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(
    f"Training:\n"
    f"{TRAIN_OUTPUT.resolve()}"
)

print(
    f"\nTesting:\n"
    f"{TEST_OUTPUT.resolve()}"
)

print("\n" + "=" * 70)
print("STEP 25 COMPLETE")
print("=" * 70)