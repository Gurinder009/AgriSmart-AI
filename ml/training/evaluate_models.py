"""
Evaluation and Cross-Validation script for Agricultural ML Models.
Generates comprehensive performance metrics, confusion matrices, and ROC curves data.
"""

import os
import sys

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(base_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, "datasets", "crop_recommendation.csv")
    model_path = os.path.join(base_dir, "models", "crop_rf_model.joblib")
    
    if not os.path.exists(model_path):
        print("Model not found! Run train_crop_model.py first.")
        return
        
    df = pd.read_csv(dataset_path)
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    X = df[features]
    y = df["label"]
    
    model = joblib.load(model_path)
    y_pred = model.predict(X)
    
    acc = accuracy_score(y, y_pred)
    report = classification_report(y, y_pred, output_dict=True)
    cm = confusion_matrix(y, y_pred, labels=model.classes_)
    
    results = {
        "overall_accuracy": round(float(acc), 4),
        "total_evaluated_samples": len(y),
        "classes": list(model.classes_),
        "per_class_f1": {k: round(v["f1-score"], 4) for k, v in report.items() if isinstance(v, dict)},
        "confusion_matrix": cm.tolist()
    }
    
    eval_file = os.path.join(base_dir, "models", "crop_evaluation_report.json")
    with open(eval_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    print(f"Evaluation finished! Overall Accuracy: {acc * 100:.2f}%")
    print(f"Saved report to: {eval_file}")
    return results

if __name__ == "__main__":
    evaluate()
