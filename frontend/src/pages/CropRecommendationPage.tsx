import React, { useState, useEffect } from 'react';
import { cropApi, farmsApi } from '../services/api';
import { CropRecommendResult, Farm } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout, Sparkles, CheckCircle, Info,
  History, ArrowRight, BookOpen, Layers, BarChart2
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const CropRecommendationPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    nitrogen: 90.0,
    phosphorus: 42.0,
    potassium: 43.0,
    temperature: 24.0,
    humidity: 65.0,
    ph: 6.5,
    rainfall: 120.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [farmList, hist] = await Promise.all([
          farmsApi.getAll(),
          cropApi.getHistory()
        ]);
        setFarms(farmList);
        setHistory(hist);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handlePreset = (preset: { n: number; p: number; k: number; temp: number; hum: number; ph: number; rain: number }) => {
    setFormData({
      nitrogen: preset.n,
      phosphorus: preset.p,
      potassium: preset.k,
      temperature: preset.temp,
      humidity: preset.hum,
      ph: preset.ph,
      rainfall: preset.rain,
    });
    addToast('info', 'Preset values loaded into parameters.');
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await cropApi.recommend({
        farm_id: selectedFarmId,
        ...formData,
      });
      setResult(res);
      addToast('success', `Top crop recommended: ${res.recommended_crop.toUpperCase()}`);
      // Refresh history
      const hist = await cropApi.getHistory();
      setHistory(hist);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Failed to generate recommendation.');
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
            <span>Random Forest Supervised ML Model (23 Crops)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.cropRecommendation}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Predict high-yield crop matches calibrated against soil nutrient vectors and meteorological data.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Associate Farm:</span>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farm_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-600 mr-1">Agro-Climatic Presets:</span>
        <button
          onClick={() => handlePreset({ n: 95, p: 45, k: 42, temp: 20, hum: 58, ph: 6.5, rain: 75 })}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-forest-50 hover:text-forest-700 font-semibold transition"
        >
          🌾 Punjab Wheat (Rabi)
        </button>
        <button
          onClick={() => handlePreset({ n: 80, p: 48, k: 40, temp: 24, hum: 82, ph: 6.4, rain: 235 })}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-forest-50 hover:text-forest-700 font-semibold transition"
        >
          🍚 Rice Delta (Kharif)
        </button>
        <button
          onClick={() => handlePreset({ n: 118, p: 46, k: 19, temp: 24, hum: 79, ph: 6.9, rain: 80 })}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-forest-50 hover:text-forest-700 font-semibold transition"
        >
          🌱 Cotton (Black Soil)
        </button>
        <button
          onClick={() => handlePreset({ n: 40, p: 68, k: 80, temp: 19, hum: 17, ph: 7.3, rain: 80 })}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-forest-50 hover:text-forest-700 font-semibold transition"
        >
          🥣 Chickpea Pulse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest-600" />
            Enter Soil & Environmental Vectors
          </h3>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* NPK Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.nitrogen} <span className="text-slate-400 font-normal">(kg/ha)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.5"
                  required
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phosphorus} <span className="text-slate-400 font-normal">(kg/ha)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.5"
                  required
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.potassium} <span className="text-slate-400 font-normal">(kg/ha)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.5"
                  required
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            {/* pH & Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Soil pH <span className="text-slate-400 font-normal">(3.0 - 10.0)</span>
                </label>
                <input
                  type="number"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  required
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 7 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temperature <span className="text-slate-400 font-normal">(°C)</span>
                </label>
                <input
                  type="number"
                  min="-5"
                  max="55"
                  step="0.5"
                  required
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 25 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Humidity & Rainfall */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relative Humidity <span className="text-slate-400 font-normal">(%)</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="1"
                  required
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 60 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rainfall / Precipitation <span className="text-slate-400 font-normal">(mm)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  step="1"
                  required
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 100 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? t.analyzing : t.predictNow}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Prediction Results Display (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <LoadingSkeleton rows={5} />
            </div>
          ) : result ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-300/80 shadow-lg space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  ML Classification Result
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {result.confidence}% Confidence
                </span>
              </div>

              <div className="text-center py-4 bg-gradient-to-b from-forest-50 to-white rounded-2xl border border-forest-100">
                <div className="w-14 h-14 rounded-2xl bg-forest-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Sprout className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 capitalize">
                  {result.recommended_crop}
                </h2>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {result.crop_info.scientific_name}
                </p>
              </div>

              {/* Agronomic Guide */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Cultivation Season:</span>
                  <span className="font-bold text-slate-800">{result.crop_info.season}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Growth Duration:</span>
                  <span className="font-bold text-slate-800">{result.crop_info.duration_days}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Ideal Soil Type:</span>
                  <span className="font-bold text-slate-800">{result.crop_info.soil_type}</span>
                </div>
              </div>

              {/* Agronomic explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-forest-600" /> Agronomic Explanation:
                </p>
                {result.explanation}
              </div>

              {/* Alternative Crops */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Alternative Runner-Up Crops
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives.map((alt, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold capitalize flex items-center gap-1.5"
                      >
                        {alt.crop}
                        <span className="text-[10px] text-slate-400 font-normal">({alt.confidence}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center py-16">
              <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Ready to Predict</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Adjust parameters or select a preset and click "Run Analysis" to run the ML pipeline.
              </p>
            </div>
          )}

          {/* Recent Predictions History */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Recent Recommendation History
              </h3>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 capitalize">{h.recommended_crop}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        (N:{h.nitrogen}, P:{h.phosphorus}, K:{h.potassium})
                      </span>
                    </div>
                    <span className="font-semibold text-forest-700">{h.confidence}%</span>
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
