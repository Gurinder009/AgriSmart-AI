import React, { useState, useEffect } from 'react';
import { fertilizerApi, farmsApi } from '../services/api';
import { FertilizerResult, Farm } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FlaskConical, Sparkles, AlertTriangle, ShieldCheck,
  CheckCircle2, Package, Layers, ArrowRight, History
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const FertilizerPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);

  const [formData, setFormData] = useState({
    crop: 'Wheat',
    soil_type: 'Loamy',
    nitrogen: 85.0,
    phosphorus: 35.0,
    potassium: 35.0,
    ph: 6.6,
    farm_area: 5.0,
    area_unit: 'acres'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [farmData, histData] = await Promise.all([
          farmsApi.getAll(),
          fertilizerApi.getHistory()
        ]);
        setFarms(farmData);
        setHistory(histData || []);
        if (farmData.length > 0) {
          setSelectedFarmId(farmData[0].id);
          setFormData((prev) => ({
            ...prev,
            crop: farmData[0].current_crop || 'Wheat',
            farm_area: farmData[0].area || 5.0,
            soil_type: farmData[0].soil_type || 'Loamy'
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fertilizerApi.recommend({
        farm_id: selectedFarmId,
        ...formData
      });
      setResult(data);
      addToast('success', 'Fertilizer schedule calculated successfully!');
      const hist = await fertilizerApi.getHistory();
      setHistory(hist || []);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Fertilizer calculation failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nutrient Deficit & Area-Scaled Dosing Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.fertilizer}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Formulate split fertilizer dosage schedules (DAP, Urea, MOP) tailored to your exact acreage.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Selected Farm:</span>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedFarmId(id);
                const found = farms.find((f) => f.id === id);
                if (found) {
                  setFormData((prev) => ({
                    ...prev,
                    crop: found.current_crop || prev.crop,
                    farm_area: found.area,
                    soil_type: found.soil_type
                  }));
                }
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.farm_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-forest-600" />
            Field & Crop Parameters
          </h3>

          <form onSubmit={handleRecommend} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop</label>
                <input
                  type="text"
                  required
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  placeholder="Wheat, Rice, Cotton..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Texture</label>
                <select
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                >
                  <option value="Loamy">Loamy Soil</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black Soil</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy Loam</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Area</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.farm_area}
                  onChange={(e) => setFormData({ ...formData, farm_area: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                <select
                  value={formData.area_unit}
                  onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.nitrogen}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phosphorus}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.potassium}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="10.0"
                required
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 6.5 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Optimizing Dosage...' : 'Calculate Fertilizer Dosage'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Prescription Schedule (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <LoadingSkeleton rows={6} />
            </div>
          ) : result ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 animate-in fade-in">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Nutrient Plan for {result.crop}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {result.suggested_nutrient_focus}
                </h3>
              </div>

              {/* Commercial Fertilizer Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Commercial Fertilizer Schedule ({formData.farm_area} {formData.area_unit})
                </h4>

                <div className="space-y-3">
                  {result.fertilizer_schedule.map((f, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-forest-600" />
                          {f.name}
                        </span>
                        <span className="text-xs font-black text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg border border-forest-200">
                          {f.total_needed}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">Rate: {f.dose_per_unit}</p>
                      <p className="text-[11px] text-slate-500 italic">Timing: {f.application_stage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organic Amendments */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                  Organic & Bio-Fertilizers
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  {result.organic_amendments.map((oa, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-forest-50/60 border border-forest-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                      <span>{oa}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Warning */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{result.safety_warning}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center py-20">
              <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Awaiting Plot Data</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Enter your crop, soil NPK values, and farm area to generate precision fertilizer dosages.
              </p>
            </div>
          )}

          {/* Past Fertilizer Recommendations */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Previous Fertilizer Schedules
              </h3>
              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto text-xs">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 capitalize">{h.crop}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                      {h.deficiency && (
                        <p className="text-[10px] text-amber-700 mt-0.5">{h.deficiency}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-forest-700">
                      {h.recommendation?.length || 0} Blends
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};
