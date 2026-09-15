import datetime
from app.schemas import IrrigationRequest, IrrigationResponse

CROP_WATER_FACTOR = {
    "rice": 1.25,
    "sugarcane": 1.15,
    "banana": 1.10,
    "cotton": 0.85,
    "maize": 0.80,
    "wheat": 0.75,
    "chickpea": 0.55,
    "potato": 0.85,
    "tomato": 0.80
}

class IrrigationService:
    def recommend(
        self,
        data: IrrigationRequest,
        weather_source: str = None,
        weather_summary: dict = None
    ) -> IrrigationResponse:
        moisture = data.soil_moisture
        temp = data.temperature
        humidity = data.humidity
        rain_prob = data.rainfall_probability
        crop = data.crop.lower()
        kc = CROP_WATER_FACTOR.get(crop, 0.80)
        
        # Approximate daily evapotranspiration (Hargreaves / Blaney-Criddle proxy)
        et0 = max(2.0, (temp * 0.15) + ((100.0 - humidity) * 0.04))
        crop_water_loss_mm = round(et0 * kc, 1)
        
        # Decision Matrix
        if rain_prob >= 65.0:
            irrigation_required = False
            water_stress = "None"
            reason = (
                f"Significant rainfall probability ({rain_prob:.0f}%) forecast in your area. "
                "Delay irrigation to conserve water and prevent soil saturation or root asphyxiation."
            )
            duration = "0 minutes (Hold off)"
            volume = "0 Liters"
            time_window = "Postpone until rainfall event concludes"
        elif moisture < 32.0:
            irrigation_required = True
            water_stress = "Severe"
            reason = (
                f"Critical moisture deficit ({moisture:.1f}%). Crop is approaching permanent wilting point. "
                f"Daily crop water loss is approximately {crop_water_loss_mm} mm/day. Immediate irrigation required."
            )
            duration = "60 to 75 minutes (Drip) / 2 to 2.5 hours (Furrow)"
            volume = "4,500 - 5,500 Liters / acre"
            time_window = "Immediate early morning (05:30 AM - 08:30 AM) or dusk"
        elif moisture < 48.0:
            if rain_prob < 40.0:
                irrigation_required = True
                water_stress = "Moderate"
                reason = (
                    f"Soil moisture ({moisture:.1f}%) has dropped below optimal threshold for {data.crop.capitalize()}. "
                    f"Rain probability is low ({rain_prob:.0f}%). Scheduled irrigation recommended."
                )
                duration = "40 to 50 minutes (Drip) / 1.5 hours (Furrow)"
                volume = "3,000 - 3,800 Liters / acre"
                time_window = "Early morning (06:00 AM - 08:30 AM)"
            else:
                irrigation_required = False
                water_stress = "Mild"
                reason = (
                    f"Moisture is moderate ({moisture:.1f}%) and rain likelihood is moderate ({rain_prob:.0f}%). "
                    "Monitor soil for 24 hours before applying supplemental water."
                )
                duration = "Standby"
                volume = "0 Liters"
                time_window = "Re-evaluate tomorrow morning"
        else:
            irrigation_required = False
            water_stress = "None"
            reason = (
                f"Soil moisture ({moisture:.1f}%) is in the optimal root-zone aeration range (50-70%). "
                "No supplemental irrigation required today."
            )
            duration = "0 minutes"
            volume = "0 Liters"
            time_window = "Next check in 48 hours"
            
        water_saving_tips = [
            "Irrigate during early morning hours to save up to 25% water lost through direct sun evaporation.",
            "Utilize drip irrigation with pressure-compensating emitters for up to 90% water use efficiency.",
            "Spread 5-7 cm organic crop residue mulch around root zones to suppress weed transpiration.",
            "Install affordable tensiometers or soil moisture probes to schedule irrigation by matric potential rather than calendar days."
        ]
        
        return IrrigationResponse(
            irrigation_required=irrigation_required,
            soil_moisture=moisture,
            water_stress_level=water_stress,
            recommended_duration=duration,
            water_volume=volume,
            suggested_time_window=time_window,
            water_saving_tips=water_saving_tips,
            reason=reason,
            weather_source=weather_source,
            weather_summary=weather_summary,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )

irrigation_service = IrrigationService()
