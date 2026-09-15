# AgriSmart AI — Machine Learning & Computer Vision Documentation

## 1. Crop Recommendation Model Pipeline

### A. Dataset Formulation
- **Source**: Calibrated Indian agricultural dataset (`ml/datasets/crop_recommendation.csv`) covering 2,300 stratified samples.
- **23 Cultivated Crops**: Rice, Wheat, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee.
- **7 Environmental Features**:
  1. Nitrogen ($N$ in kg/ha)
  2. Phosphorus ($P$ in kg/ha)
  3. Potassium ($K$ in kg/ha)
  4. Soil pH ($pH$)
  5. Ambient Temperature ($T$ in °C)
  6. Relative Humidity ($RH$ in %)
  7. Annual / Seasonal Rainfall ($mm$)

### B. Training & Optimization
- **Algorithm**: `RandomForestClassifier` with 120 estimators, maximum tree depth of 16, and stratified train/test split (80/20).
- **Cross-Validation**: 5-fold cross-validation mean accuracy: **95.74%** ($\pm 0.81\%$).
- **Test Accuracy**: **95.43%**
- **Weighted Precision**: **95.45%**
- **Weighted Recall**: **95.43%**
- **Weighted F1-Score**: **95.39%**
- **Decision Tree Baseline**: 88.48% accuracy.

### C. Feature Importances
| Feature | Importance Percentage | Agronomic Relevance |
|---|---|---|
| **Rainfall** | 20.89% | Moisture availability is the primary crop limiter |
| **Humidity** | 19.43% | Drives transpiration and fungal disease pressure |
| **Phosphorus (P)** | 17.45% | Critical for early root and reproductive vigor |
| **Potassium (K)** | 15.71% | Controls stomatal opening and drought resilience |
| **Nitrogen (N)** | 13.82% | Drives vegetative growth and chlorophyll synthesis |
| **Temperature** | 6.40% | Thermoperiodism and season selection |
| **Soil pH** | 6.30% | Nutrient bioavailability regulator |

---

## 2. Computer Vision Leaf Pathology Pipeline

### A. Image Preprocessing
- Uploaded leaf photographs undergo MIME validation and a 10 MB ceiling check.
- Images are normalized into standard RGB color space and resized to $224 \times 224$ pixels.

### B. Botanical Feature Extraction
- **Excess Green Index (ExG)**:
  $$ExG = 2 \cdot G - R - B$$
  Measures active chlorophyll concentration against healthy green baseline.
- **Necrotic Lesion Index**:
  Identifies dark brown and necrotic fungal target spots where brightness drops and red channel dominates over degraded green.
- **Chlorosis Ratio**:
  Identifies yellow halos caused by Alternaria toxins or nutritional stress.
- **Pustule Texture Variance**:
  Distinguishes rust pustules (*Puccinia*) from smooth healthy surfaces.

### C. Supported Pathological Classes
1. **Tomato Early Blight** (*Alternaria solani*)
2. **Tomato Late Blight** (*Phytophthora infestans*)
3. **Potato Late Blight** (*Phytophthora infestans*)
4. **Rice Leaf Blast** (*Magnaporthe oryzae*)
5. **Wheat Brown Rust** (*Puccinia triticina*)
6. **Corn Common Rust** (*Puccinia sorghi*)
7. **Cotton Bacterial Blight** (*Xanthomonas*)
8. **Apple Scab** (*Venturia inaequalis*)
9. **Grape Black Rot** (*Guignardia bidwellii*)
10. **Healthy Crop Foliage** (No pathogen detected)
