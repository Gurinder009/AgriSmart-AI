import datetime
from app.schemas import SoilAnalysisRequest, SoilAnalysisResponse, ParameterStatus

class SoilService:
    def analyze(self, data: SoilAnalysisRequest) -> SoilAnalysisResponse:
        n = data.nitrogen
        p = data.phosphorus
        k = data.potassium
        ph = data.ph
        moisture = data.moisture
        
        params = {}
        score_components = []
        recommendations = []
        
        # 1. Nitrogen (kg/ha)
        if n < 50:
            n_status, n_rating, n_score = "Low", "Poor", 40
            n_rec = "Soil is nitrogen deficient. Apply well-decomposed Farmyard Manure (FYM) @ 5 tonnes/acre and split doses of Urea/Neem-coated urea."
            recommendations.append("Incorporate leguminous green manure (Dhaincha/Sunnhemp) to naturally augment soil nitrogen.")
        elif 50 <= n <= 120:
            n_status, n_rating, n_score = "Optimal", "Good", 95
            n_rec = "Nitrogen level is within healthy agronomic range. Maintain standard maintenance top-dressing."
        else:
            n_status, n_rating, n_score = "High", "Moderate", 70
            n_rec = "Excessive nitrogen detected. Reduce urea applications to prevent luxury vegetative growth, lodging, and pest susceptibility."
            recommendations.append("Cut back on chemical nitrogenous fertilizers for the upcoming crop cycle.")
            
        params["Nitrogen"] = ParameterStatus(
            value=n, unit="kg/ha", status=n_status, rating=n_rating,
            ideal_range="50 - 120 kg/ha", recommendation=n_rec
        )
        score_components.append(n_score * 0.25)
        
        # 2. Phosphorus (kg/ha)
        if p < 30:
            p_status, p_rating, p_score = "Low", "Poor", 45
            p_rec = "Phosphorus deficiency observed. Apply Single Super Phosphate (SSP) or Diammonium Phosphate (DAP) as basal dose."
            recommendations.append("Apply Phosphate Solubilizing Bacteria (PSB) biofertilizer @ 2kg/acre to unlock fixed soil phosphorus.")
        elif 30 <= p <= 80:
            p_status, p_rating, p_score = "Optimal", "Good", 95
            p_rec = "Phosphorus status is optimal for robust root development and early seedling vigor."
        else:
            p_status, p_rating, p_score = "High", "Moderate", 75
            p_rec = "Phosphorus level is elevated. Avoid indiscriminate phosphatic fertilizers to prevent zinc and iron antagonism."
            
        params["Phosphorus"] = ParameterStatus(
            value=p, unit="kg/ha", status=p_status, rating=p_rating,
            ideal_range="30 - 80 kg/ha", recommendation=p_rec
        )
        score_components.append(p_score * 0.20)
        
        # 3. Potassium (kg/ha)
        if k < 35:
            k_status, k_rating, k_score = "Low", "Poor", 45
            k_rec = "Potassium is low. Apply Muriate of Potash (MOP) to enhance disease resistance, stalk strength, and drought tolerance."
        elif 35 <= k <= 90:
            k_status, k_rating, k_score = "Optimal", "Good", 95
            k_rec = "Potassium availability is well-balanced. Ensures optimal stomatal regulation and grain filling."
        else:
            k_status, k_rating, k_score = "High", "Moderate", 80
            k_rec = "Adequate to high potassium reserves. No immediate potash supplementation required."
            
        params["Potassium"] = ParameterStatus(
            value=k, unit="kg/ha", status=k_status, rating=k_rating,
            ideal_range="35 - 90 kg/ha", recommendation=k_rec
        )
        score_components.append(k_score * 0.20)
        
        # 4. Soil pH
        if ph < 5.8:
            ph_status, ph_rating, ph_score = "Acidic", "Poor", 50
            ph_rec = "Acidic soil inhibits nutrient uptake. Apply agricultural lime (calcium carbonate) or dolomite @ 250-500 kg/acre."
            recommendations.append("Apply lime 3-4 weeks prior to sowing to neutralize sub-surface soil acidity.")
        elif 5.8 <= ph <= 7.5:
            ph_status, ph_rating, ph_score = "Optimal", "Excellent", 98
            ph_rec = "Near-neutral pH provides optimal conditions for maximum microbial activity and nutrient bioavailability."
        else:
            ph_status, ph_rating, ph_score = "Alkaline / Saline", "Poor", 55
            ph_rec = "Alkaline soil can induce micronutrient chlorosis. Apply agricultural gypsum or elemental sulfur."
            recommendations.append("Incorporate gypsum and provide flushing drainage to leach out excess soluble sodium salts.")
            
        params["pH"] = ParameterStatus(
            value=ph, unit="pH", status=ph_status, rating=ph_rating,
            ideal_range="6.0 - 7.5", recommendation=ph_rec
        )
        score_components.append(ph_score * 0.20)
        
        # 5. Moisture %
        if moisture < 30:
            m_status, m_rating, m_score = "Dry", "Critical", 40
            m_rec = "Soil moisture is below wilting threshold. Immediate irrigation recommended to prevent crop desiccation."
            recommendations.append("Deploy drip or furrow irrigation immediately. Apply organic mulch to suppress evaporative loss.")
        elif 30 <= moisture <= 70:
            m_status, m_rating, m_score = "Optimal", "Excellent", 95
            m_rec = "Adequate moisture level for optimal root respiration and capillary water transport."
        else:
            m_status, m_rating, m_score = "Waterlogged", "Warning", 60
            m_rec = "High saturation / waterlogging risk. Ensure furrow drainage to prevent root hypoxia and phytophthora rot."
            recommendations.append("Open drainage channels immediately to drain standing gravitational water.")
            
        params["Moisture"] = ParameterStatus(
            value=moisture, unit="%", status=m_status, rating=m_rating,
            ideal_range="35% - 65%", recommendation=m_rec
        )
        score_components.append(m_score * 0.15)
        
        total_health_score = round(sum(score_components), 1)
        if total_health_score >= 85:
            overall_rating = "Excellent Soil Fertility"
        elif total_health_score >= 70:
            overall_rating = "Good Agricultural Condition"
        elif total_health_score >= 50:
            overall_rating = "Moderate / Needs Amendment"
        else:
            overall_rating = "Degraded / Immediate Care Required"
            
        # Suitable crops based on pH and texture
        if ph < 6.0:
            crops = ["Tea", "Potato", "Rice", "Pineapple", "Maize"]
        elif ph > 7.8:
            crops = ["Barley", "Cotton", "Wheat", "Mustard", "Sugarcane"]
        else:
            crops = ["Wheat", "Rice", "Chickpea", "Soybean", "Maize", "Cotton"]
            
        return SoilAnalysisResponse(
            farm_id=data.farm_id,
            health_score=total_health_score,
            overall_rating=overall_rating,
            parameters=params,
            recommendations=recommendations,
            suitable_crops=crops,
            recorded_at=datetime.datetime.utcnow()
        )

soil_service = SoilService()
