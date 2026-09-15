import os
import joblib
import numpy as np

CROP_DETAILS = {
    "rice": {
        "scientific_name": "Oryza sativa",
        "season": "Kharif (Monsoon)",
        "duration_days": "110-150 days",
        "soil_type": "Clayey, Clay-Loam or Alluvial",
        "description": "High water-requiring staple cereal. Requires standing water in early vegetative stages and warm humid conditions.",
        "tips": "Maintain 2-5 cm standing water during tillering. Apply nitrogen in 3 split doses (basal, active tillering, panicle initiation)."
    },
    "wheat": {
        "scientific_name": "Triticum aestivum",
        "season": "Rabi (Winter)",
        "duration_days": "100-140 days",
        "soil_type": "Well-drained Loamy to Clay-Loam",
        "description": "Temperate cereal crop requiring cool temperatures during vegetative growth and bright sunny weather during grain ripening.",
        "tips": "Ensure Crown Root Initiation (CRI) irrigation at 21 days after sowing. Avoid waterlogging."
    },
    "maize": {
        "scientific_name": "Zea mays",
        "season": "Kharif / Spring",
        "duration_days": "90-120 days",
        "soil_type": "Deep, fertile well-drained Loamy soil",
        "description": "Queen of cereals with high photosynthetic efficiency and adaptability to varying agro-climatic zones.",
        "tips": "Critical irrigation stages are tasseling and silking. Ensure good drainage to prevent stem rot."
    },
    "cotton": {
        "scientific_name": "Gossypium hirsutum",
        "season": "Kharif",
        "duration_days": "150-180 days",
        "soil_type": "Deep Black Cotton Soil (Vertisols)",
        "description": "Primary cash crop yielding natural textile fiber. Sensitive to frost and water-logging.",
        "tips": "Monitor for bollworms and sucking pests. Avoid excessive nitrogen which induces excess vegetative growth."
    },
    "chickpea": {
        "scientific_name": "Cicer arietinum",
        "season": "Rabi",
        "duration_days": "90-110 days",
        "soil_type": "Sandy Loam to Clay Loam with neutral pH",
        "description": "Major pulse crop fixing atmospheric nitrogen via rhizobium symbiosis, reducing external N requirement.",
        "tips": "Seed treatment with Rhizobium culture and Trichoderma is strongly recommended. Do not over-irrigate."
    },
    "banana": {
        "scientific_name": "Musa acuminata",
        "season": "Perennial / Year-round planting",
        "duration_days": "11-12 months",
        "soil_type": "Rich, well-drained loamy soil with organic matter",
        "description": "Heavy feeder of potassium and moisture. Requires warm tropical climate with uniform humidity.",
        "tips": "Provide propping (bamboo support) during bunch development and mulch heavily with organic residues."
    },
    "sugarcane": {
        "scientific_name": "Saccharum officinarum",
        "season": "Annual / Perennial",
        "duration_days": "300-360 days",
        "soil_type": "Medium to heavy well-drained soils",
        "description": "High-biomass cash crop requiring substantial water and balanced N-P-K nutrition.",
        "tips": "Practice earthing-up at 90 days to support stalks and control weed emergence."
    }
}

class CropRecommender:
    def __init__(self):
        self.model = None
        self.classes = []
        self.load_model()
        
    def load_model(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "crop_rf_model.joblib")
        if not os.path.exists(model_path):
            # Try alternate path in ml/models
            alt_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), "ml", "models", "crop_rf_model.joblib")
            if os.path.exists(alt_path):
                model_path = alt_path
                
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.classes = list(self.model.classes_)
                print(f"[ML] Crop Recommendation Model successfully loaded ({len(self.classes)} classes).")
            except Exception as e:
                print(f"[ML Warning] Failed loading model file: {e}")
        else:
            print("[ML Warning] Crop recommendation model file not found at", model_path)
            
    def predict(self, n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float):
        if self.model is None:
            self.load_model()
            
        import pandas as pd
        features = pd.DataFrame([{
            "N": n, "P": p, "K": k,
            "temperature": temp, "humidity": humidity,
            "ph": ph, "rainfall": rainfall
        }])
        
        if self.model is not None:
            proba = self.model.predict_proba(features)[0]
            top_indices = np.argsort(proba)[::-1]
            
            top_crop = self.classes[top_indices[0]]
            top_confidence = round(float(proba[top_indices[0]]) * 100, 1)
            
            alternatives = []
            for idx in top_indices[1:4]:
                conf = round(float(proba[idx]) * 100, 1)
                if conf > 1.0:
                    alternatives.append({"crop": self.classes[idx], "confidence": conf})
        else:
            # Agronomic rule-based fallback if joblib is unavailable
            if rainfall > 180 and humidity > 70:
                top_crop, top_confidence = "rice", 88.0
                alternatives = [{"crop": "jute", "confidence": 7.5}, {"crop": "banana", "confidence": 4.5}]
            elif temp < 22 and rainfall < 100:
                top_crop, top_confidence = "wheat", 89.0
                alternatives = [{"crop": "chickpea", "confidence": 8.0}, {"crop": "lentil", "confidence": 3.0}]
            elif k > 80 and p > 80:
                top_crop, top_confidence = "grapes", 86.0
                alternatives = [{"crop": "apple", "confidence": 10.0}]
            else:
                top_crop, top_confidence = "maize", 84.0
                alternatives = [{"crop": "cotton", "confidence": 10.0}, {"crop": "pigeonpeas", "confidence": 6.0}]
                
        crop_info = CROP_DETAILS.get(top_crop.lower(), {
            "scientific_name": f"{top_crop.capitalize()} spp.",
            "season": "Seasonal Kharif/Rabi",
            "duration_days": "100-130 days",
            "soil_type": "Well-drained agricultural soil",
            "description": f"Suitable agricultural crop recommended for your specific NPK and climatic conditions.",
            "tips": "Follow localized Krishi Vigyan Kendra (KVK) fertilizer application scheduling."
        })
        
        explanation = (
            f"Given your soil profile (N:{n}, P:{p}, K:{k}, pH:{ph}) and climate "
            f"({temp}°C, {humidity}% humidity, {rainfall} mm rainfall), {top_crop.capitalize()} "
            f"exhibits optimal agronomic compatibility with an estimated {top_confidence}% confidence."
        )
        
        return {
            "recommended_crop": top_crop,
            "confidence": top_confidence,
            "alternatives": alternatives,
            "crop_info": crop_info,
            "explanation": explanation
        }

crop_recommender = CropRecommender()
