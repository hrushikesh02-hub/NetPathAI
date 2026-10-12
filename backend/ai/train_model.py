"""
AI Model Training Pipeline for NetPath AI.
Trains Isolation Forest for anomaly detection and Random Forest Classifier for Health Classification.
"""

import os
import json
import hashlib
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import sklearn

if __package__:
    from .dataset import generate_network_dataset, FEATURE_COLUMNS
else:
    from dataset import generate_network_dataset, FEATURE_COLUMNS

def train_and_save_models(output_dir: str = None):
    """Generates dataset, trains models, evaluates metrics, and persists artifacts."""
    if output_dir is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(os.path.dirname(current_dir), "models")
    
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 60)
    print("NetPath AI - Model Training Pipeline")
    print("=" * 60)

    print("[1/4] Generating synthetic network telemetry dataset...")
    df = generate_network_dataset(num_samples=4000, random_state=42)
    print(f"Dataset generated: {len(df)} records across {df['condition'].nunique()} conditions.")

    # Keep sample IDs so the exported split is exactly the one used by the models.
    df.insert(0, "sample_id", np.arange(len(df)))
    train_rows, test_rows = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df["health_class"]
    )
    X_train, X_test = (rows[FEATURE_COLUMNS].values for rows in (train_rows, test_rows))
    y_h_train, y_h_test = (rows["health_class"].values for rows in (train_rows, test_rows))
    y_a_train, y_a_test = (rows["anomaly"].values for rows in (train_rows, test_rows))

    # 1. Feature Scaler
    print("[2/4] Fitting StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 2. Isolation Forest (Anomaly Detection)
    print("[3/4] Training Isolation Forest for Unsupervised Anomaly Detection...")
    # Train primarily on normal baseline with small contamination
    normal_indices = np.where(y_a_train == 0)[0]
    X_train_normal = X_train_scaled[normal_indices]

    iso_forest = IsolationForest(
        n_estimators=150,
        max_samples=256,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_normal)

    # Evaluate Isolation Forest
    iso_preds = iso_forest.predict(X_test_scaled)
    # -1 is anomaly, 1 is normal
    iso_binary = np.where(iso_preds == -1, 1, 0)
    iso_acc = accuracy_score(y_a_test, iso_binary)
    print(f"Isolation Forest Anomaly Detection Accuracy: {iso_acc * 100:.2f}%")

    # 3. Random Forest (Health Classifier: HEALTHY, WARNING, CRITICAL)
    print("[4/4] Training Multi-class Random Forest Health Classifier...")
    rf_classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    rf_classifier.fit(X_train, y_h_train)

    rf_preds = rf_classifier.predict(X_test)
    rf_acc = accuracy_score(y_h_test, rf_preds)
    print(f"Random Forest Health Classifier Accuracy: {rf_acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_h_test, rf_preds))

    # Save artifacts
    scaler_path = os.path.join(output_dir, "scaler.joblib")
    iso_path = os.path.join(output_dir, "isolation_forest.joblib")
    rf_path = os.path.join(output_dir, "health_classifier.joblib")
    metrics_path = os.path.join(output_dir, "training_metrics.json")

    joblib.dump(scaler, scaler_path)
    joblib.dump(iso_forest, iso_path)
    joblib.dump(rf_classifier, rf_path)

    dataset_dir = os.path.join(output_dir, "dataset")
    os.makedirs(dataset_dir, exist_ok=True)
    train_rows.to_csv(os.path.join(dataset_dir, "train.csv"), index=False)
    test_rows.to_csv(os.path.join(dataset_dir, "test.csv"), index=False)
    predictions = test_rows[["sample_id", "condition", "health_class", "anomaly"]].copy()
    predictions["predicted_health"] = rf_preds
    predictions["predicted_anomaly"] = iso_binary
    predictions["health_class_score"] = rf_classifier.predict_proba(X_test).max(axis=1)
    predictions["anomaly_score"] = iso_forest.decision_function(X_test_scaled)
    predictions.to_csv(os.path.join(dataset_dir, "test_predictions.csv"), index=False)
    dataset_files = {}
    for filename in ("train.csv", "test.csv", "test_predictions.csv"):
        with open(os.path.join(dataset_dir, filename), "rb") as handle:
            dataset_files[filename] = {"path": f"dataset/{filename}", "sha256": hashlib.sha256(handle.read()).hexdigest()}

    training_meta = {
        "isolation_forest_accuracy": round(float(iso_acc), 4),
        "health_classifier_accuracy": round(float(rf_acc), 4),
        "feature_columns": FEATURE_COLUMNS,
        "classes": ["HEALTHY", "WARNING", "CRITICAL"],
        "num_training_samples": len(X_train),
        "num_testing_samples": len(X_test),
        "status": "trained_successfully"
    }
    training_meta.update(
        sklearn_version=sklearn.__version__,
        data_source="synthetic",
        evaluation_scope="Held-out samples from the same synthetic generator; not real-world validation.",
        confidence_calibrated=False,
        random_seed=42,
        dataset_files=dataset_files,
        num_anomaly_training_samples=len(X_train_normal),
        anomaly_confusion_matrix=confusion_matrix(y_a_test, iso_binary, labels=[0, 1]).tolist(),
        anomaly_classification_report=classification_report(y_a_test, iso_binary, output_dict=True),
        health_classification_report=classification_report(y_h_test, rf_preds, output_dict=True),
    )

    with open(metrics_path, "w") as f:
        json.dump(training_meta, f, indent=2)

    print("=" * 60)
    print(f"All AI models and scalers saved successfully to: {output_dir}")
    print("=" * 60)

if __name__ == "__main__":
    train_and_save_models()
