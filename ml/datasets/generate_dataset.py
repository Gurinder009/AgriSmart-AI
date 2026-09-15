"""
Dataset generator for Agricultural Crop Recommendation.
Generates 2,300 scientifically calibrated samples across 23 key Indian agricultural crops:
Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram,
Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange,
Papaya, Coconut, Cotton, Jute, Coffee, Wheat.

Features:
N (Nitrogen): kg/ha
P (Phosphorus): kg/ha
K (Potassium): kg/ha
temperature: degrees Celsius
humidity: relative humidity %
ph: soil pH (0-14)
rainfall: precipitation in mm
"""

import os
import csv
import random

# Agronomic optimal ranges [mean, std_dev] for Indian agriculture
CROP_PROFILES = {
    "rice": {
        "N": (80, 15), "P": (48, 10), "K": (40, 8),
        "temperature": (24, 3), "humidity": (82, 6), "ph": (6.4, 0.5), "rainfall": (235, 30)
    },
    "wheat": {
        "N": (95, 12), "P": (45, 8), "K": (42, 6),
        "temperature": (20, 3), "humidity": (58, 8), "ph": (6.5, 0.4), "rainfall": (75, 15)
    },
    "maize": {
        "N": (78, 14), "P": (48, 9), "K": (20, 5),
        "temperature": (23, 4), "humidity": (65, 8), "ph": (6.2, 0.5), "rainfall": (85, 20)
    },
    "chickpea": {
        "N": (40, 10), "P": (68, 8), "K": (80, 8),
        "temperature": (19, 3), "humidity": (17, 4), "ph": (7.3, 0.4), "rainfall": (80, 15)
    },
    "kidneybeans": {
        "N": (21, 6), "P": (67, 8), "K": (20, 5),
        "temperature": (20, 3), "humidity": (22, 4), "ph": (5.7, 0.4), "rainfall": (105, 20)
    },
    "pigeonpeas": {
        "N": (21, 6), "P": (68, 8), "K": (20, 5),
        "temperature": (28, 4), "humidity": (48, 8), "ph": (5.7, 0.5), "rainfall": (150, 25)
    },
    "mothbeans": {
        "N": (21, 6), "P": (48, 8), "K": (20, 5),
        "temperature": (28, 3), "humidity": (53, 7), "ph": (6.8, 0.5), "rainfall": (52, 12)
    },
    "mungbean": {
        "N": (21, 6), "P": (48, 8), "K": (20, 5),
        "temperature": (28, 3), "humidity": (85, 5), "ph": (6.7, 0.4), "rainfall": (48, 10)
    },
    "blackgram": {
        "N": (40, 8), "P": (68, 8), "K": (19, 4),
        "temperature": (30, 3), "humidity": (65, 6), "ph": (7.1, 0.4), "rainfall": (68, 12)
    },
    "lentil": {
        "N": (19, 5), "P": (68, 8), "K": (19, 4),
        "temperature": (25, 4), "humidity": (65, 8), "ph": (6.9, 0.5), "rainfall": (46, 10)
    },
    "pomegranate": {
        "N": (19, 5), "P": (19, 5), "K": (40, 6),
        "temperature": (22, 3), "humidity": (90, 4), "ph": (6.4, 0.4), "rainfall": (108, 15)
    },
    "banana": {
        "N": (100, 15), "P": (82, 10), "K": (50, 8),
        "temperature": (27, 3), "humidity": (80, 5), "ph": (6.0, 0.4), "rainfall": (105, 18)
    },
    "mango": {
        "N": (20, 5), "P": (27, 5), "K": (30, 5),
        "temperature": (31, 3), "humidity": (50, 6), "ph": (5.8, 0.4), "rainfall": (95, 15)
    },
    "grapes": {
        "N": (23, 6), "P": (132, 12), "K": (200, 15),
        "temperature": (24, 4), "humidity": (82, 5), "ph": (6.0, 0.4), "rainfall": (70, 10)
    },
    "watermelon": {
        "N": (99, 12), "P": (18, 4), "K": (50, 6),
        "temperature": (26, 3), "humidity": (85, 5), "ph": (6.5, 0.4), "rainfall": (50, 10)
    },
    "muskmelon": {
        "N": (100, 12), "P": (18, 4), "K": (50, 6),
        "temperature": (28, 3), "humidity": (92, 4), "ph": (6.4, 0.4), "rainfall": (25, 6)
    },
    "apple": {
        "N": (21, 6), "P": (135, 12), "K": (199, 15),
        "temperature": (22, 3), "humidity": (92, 4), "ph": (5.9, 0.4), "rainfall": (112, 15)
    },
    "orange": {
        "N": (20, 5), "P": (16, 4), "K": (10, 3),
        "temperature": (23, 3), "humidity": (92, 4), "ph": (7.0, 0.4), "rainfall": (110, 15)
    },
    "papaya": {
        "N": (50, 10), "P": (59, 8), "K": (50, 8),
        "temperature": (34, 3), "humidity": (92, 4), "ph": (6.7, 0.4), "rainfall": (142, 20)
    },
    "coconut": {
        "N": (22, 6), "P": (17, 4), "K": (31, 5),
        "temperature": (27, 3), "humidity": (95, 3), "ph": (6.0, 0.4), "rainfall": (175, 25)
    },
    "cotton": {
        "N": (118, 15), "P": (46, 8), "K": (19, 4),
        "temperature": (24, 3), "humidity": (79, 6), "ph": (6.9, 0.4), "rainfall": (80, 15)
    },
    "jute": {
        "N": (78, 12), "P": (46, 8), "K": (40, 6),
        "temperature": (25, 3), "humidity": (79, 6), "ph": (6.7, 0.4), "rainfall": (175, 25)
    },
    "coffee": {
        "N": (101, 15), "P": (29, 6), "K": (30, 5),
        "temperature": (25, 3), "humidity": (58, 6), "ph": (6.8, 0.4), "rainfall": (158, 25)
    }
}

def generate_dataset(samples_per_crop=100, output_path="crop_recommendation.csv"):
    random.seed(42)
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    headers = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"]
    rows = []
    
    for crop, profile in CROP_PROFILES.items():
        for _ in range(samples_per_crop):
            n = max(0, round(random.gauss(profile["N"][0], profile["N"][1]), 1))
            p = max(0, round(random.gauss(profile["P"][0], profile["P"][1]), 1))
            k = max(0, round(random.gauss(profile["K"][0], profile["K"][1]), 1))
            temp = max(5.0, round(random.gauss(profile["temperature"][0], profile["temperature"][1]), 2))
            humidity = min(100.0, max(10.0, round(random.gauss(profile["humidity"][0], profile["humidity"][1]), 2)))
            ph = min(12.0, max(3.5, round(random.gauss(profile["ph"][0], profile["ph"][1]), 2)))
            rain = max(10.0, round(random.gauss(profile["rainfall"][0], profile["rainfall"][1]), 2))
            
            rows.append([n, p, k, temp, humidity, ph, rain, crop])
            
    random.shuffle(rows)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
        
    print(f"Dataset successfully created with {len(rows)} samples across {len(CROP_PROFILES)} crops: {output_path}")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "crop_recommendation.csv"
    generate_dataset(output_path=out)
