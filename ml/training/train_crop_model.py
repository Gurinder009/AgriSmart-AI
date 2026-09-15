"""
Machine Learning Training Pipeline for Crop Recommendation
Trains Random Forest and Decision Tree classifiers on N, P, K, pH, temperature, humidity, rainfall.
Exports the optimized production model and evaluation metrics.
"""

import os
import sys

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(base_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

def run_training(dataset_path=None, model_output_dir=None):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if not dataset_path:
        dataset_path = os.path.join(base_dir, "datasets", "crop_recommendation.csv")
    if not model_output_dir:
        model_output_dir = os.path.join(base_dir, "models")
        
    os.makedirs(model_output_dir, exist_ok=True)
    
    # Check dataset existence, or auto-generate
    if not os.path.exists(dataset_path):
        from ml.datasets.generate_dataset import generate_dataset
        print(f"Generating dataset at {dataset_path}...")
        generate_dataset(samples_per_crop=100, output_path=dataset_path)
        
    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Target crops ({df['label'].nunique()}): {list(df['label'].unique())}")
    
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    X = df[features]
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]} samples, Testing set: {X_test.shape[0]} samples")
    
    # 1. Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=16,
        min_samples_split=3,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    y_pred_rf = rf_model.predict(X_test)
    acc_rf = accuracy_score(y_test, y_pred_rf)
    p_rf, r_rf, f1_rf, _ = precision_recall_fscore_support(y_test, y_pred_rf, average="weighted")
    cv_scores = cross_val_score(rf_model, X, y, cv=5)
    
    print("\n" + "="*50)
    print("RANDOM FOREST MODEL EVALUATION")
    print("="*50)
    print(f"Accuracy:  {acc_rf * 100:.2f}%")
    print(f"Precision: {p_rf * 100:.2f}%")
    print(f"Recall:    {r_rf * 100:.2f}%")
    print(f"F1-Score:  {f1_rf * 100:.2f}%")
    print(f"5-Fold CV: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
    
    # 2. Compare with Decision Tree Baseline
    dt_model = DecisionTreeClassifier(random_state=42)
    dt_model.fit(X_train, y_train)
    y_pred_dt = dt_model.predict(X_test)
    acc_dt = accuracy_score(y_test, y_pred_dt)
    print(f"\nBaseline Decision Tree Accuracy: {acc_dt * 100:.2f}%")
    
    # Feature Importances
    feature_importances = dict(zip(features, [round(float(v), 4) for v in rf_model.feature_importances_]))
    print("\nFeature Importances:")
    for feat, imp in sorted(feature_importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {feat}: {imp * 100:.2f}%")
        
    # Save Model & Metadata
    model_path = os.path.join(model_output_dir, "crop_rf_model.joblib")
    joblib.dump(rf_model, model_path)
    print(f"\nSaved production model to: {model_path}")
    
    # Also save directly into backend/app/ml/ for server startup
    backend_ml_dir = os.path.join(os.path.dirname(base_dir), "backend", "app", "ml")
    os.makedirs(backend_ml_dir, exist_ok=True)
    backend_model_path = os.path.join(backend_ml_dir, "crop_rf_model.joblib")
    joblib.dump(rf_model, backend_model_path)
    print(f"Synchronized model to backend: {backend_model_path}")
    
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 120,
        "features": features,
        "classes": list(rf_model.classes_),
        "accuracy": round(float(acc_rf), 4),
        "precision": round(float(p_rf), 4),
        "recall": round(float(r_rf), 4),
        "f1_score": round(float(f1_rf), 4),
        "cv_mean": round(float(cv_scores.mean()), 4),
        "feature_importances": feature_importances,
        "total_samples": len(df),
        "num_classes": len(rf_model.classes_)
    }
    
    meta_path = os.path.join(model_output_dir, "crop_model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    with open(os.path.join(backend_ml_dir, "crop_model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved evaluation metadata to: {meta_path}")
    return metadata

if __name__ == "__main__":
    run_training()
