from app.schemas import FertilizerRequest, FertilizerResponse, FertilizerBlendItem

CROP_TARGET_NPK = {
    "wheat": {"n": 100, "p": 50, "k": 40},
    "rice": {"n": 100, "p": 50, "k": 50},
    "maize": {"n": 120, "p": 60, "k": 40},
    "cotton": {"n": 120, "p": 60, "k": 60},
    "chickpea": {"n": 30, "p": 60, "k": 30},
    "sugarcane": {"n": 180, "p": 80, "k": 80},
    "potato": {"n": 150, "p": 100, "k": 120}
}

class FertilizerService:
    def recommend(self, data: FertilizerRequest) -> FertilizerResponse:
        crop_key = data.crop.lower()
        target = CROP_TARGET_NPK.get(crop_key, {"n": 90, "p": 50, "k": 45})
        
        area = data.farm_area
        unit = data.area_unit
        
        # Calculate deficits in kg/ha or kg/acre
        def_n = max(0.0, target["n"] - data.nitrogen)
        def_p = max(0.0, target["p"] - data.phosphorus)
        def_k = max(0.0, target["k"] - data.potassium)
        
        deficiencies = []
        if def_n > 20:
            deficiencies.append(f"Nitrogen deficit: ~{round(def_n, 1)} kg/ha")
        if def_p > 15:
            deficiencies.append(f"Phosphorus deficit: ~{round(def_p, 1)} kg/ha")
        if def_k > 15:
            deficiencies.append(f"Potassium deficit: ~{round(def_k, 1)} kg/ha")
            
        if not deficiencies:
            deficiencies.append("Nutrient levels meet baseline crop targets. Maintenance fertilization recommended.")
            focus = "Maintenance N-P-K balance and organic carbon replenishment."
        else:
            focus = f"Primary focus on replenishing {', '.join([d.split(':')[0] for d in deficiencies])}."
            
        # Fertilizer dosage calculation based on standard fertilizer grades:
        # Urea: 46% N
        # DAP (Di-ammonium Phosphate): 18% N, 46% P2O5
        # MOP (Muriate of Potash): 60% K2O
        
        # 1. DAP for Phosphorus
        dap_per_acre = round((def_p / 0.46) * 0.4047, 1) if def_p > 0 else 25.0
        n_supplied_by_dap = dap_per_acre * 0.18
        
        # 2. Urea for remaining Nitrogen
        rem_n = max(0.0, (def_n * 0.4047) - n_supplied_by_dap)
        urea_per_acre = round(rem_n / 0.46, 1) if rem_n > 0 else 30.0
        
        # 3. MOP for Potassium
        mop_per_acre = round((def_k / 0.60) * 0.4047, 1) if def_k > 0 else 20.0
        
        schedule = [
            FertilizerBlendItem(
                name="DAP (18-46-0)",
                dose_per_unit=f"{dap_per_acre} kg/{unit[:-1] if unit.endswith('s') else unit}",
                total_needed=f"{round(dap_per_acre * area, 1)} kg total",
                application_stage="Basal application at the time of final land preparation or sowing."
            ),
            FertilizerBlendItem(
                name="Neem-Coated Urea (46-0-0)",
                dose_per_unit=f"{urea_per_acre} kg/{unit[:-1] if unit.endswith('s') else unit}",
                total_needed=f"{round(urea_per_acre * area, 1)} kg total",
                application_stage="Split into 2-3 top dressings: 50% at active tillering, 50% at panicle/flowering stage."
            ),
            FertilizerBlendItem(
                name="Muriate of Potash - MOP (0-0-60)",
                dose_per_unit=f"{mop_per_acre} kg/{unit[:-1] if unit.endswith('s') else unit}",
                total_needed=f"{round(mop_per_acre * area, 1)} kg total",
                application_stage="Full basal dose or 50% basal + 50% at boot/flowering stage."
            )
        ]
        
        organic_amendments = [
            "Incorporate well-rotted Farm Yard Manure (FYM) or Compost @ 4-5 tonnes/acre before sowing.",
            "Seed treatment with Azotobacter / Rhizobium (for pulses) and PSB (Phosphate Solubilizing Bacteria) @ 250g per 10kg seeds.",
            "Apply Vermicompost @ 1 tonne/acre along seed furrows to stimulate beneficial soil mycorrhizae."
        ]
        
        application_considerations = [
            "Never top-dress urea on dry soil or standing gravitational water; apply under optimum soil moisture.",
            "In alkaline soils (pH > 7.8), band-place phosphatic fertilizers near the seed line rather than broadcast to minimize phosphorus fixation.",
            "Split nitrogen applications ensure 25-30% higher nitrogen-use efficiency (NUE) and reduce groundwater nitrate leaching."
        ]
        
        safety_warning = (
            "SAFETY NOTICE: Always wear gloves and masks when handling agrochemicals. "
            "Do not mix systemic insecticides with alkaline sprays or copper fungicides without jar-test compatibility. "
            "Follow State Agricultural University / Krishi Vigyan Kendra package of practices."
        )
        
        return FertilizerResponse(
            crop=data.crop.capitalize(),
            deficiencies=deficiencies,
            suggested_nutrient_focus=focus,
            fertilizer_schedule=schedule,
            organic_amendments=organic_amendments,
            application_considerations=application_considerations,
            safety_warning=safety_warning
        )

fertilizer_service = FertilizerService()
