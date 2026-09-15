import React, { useState, useEffect } from 'react';
import { soilApi, farmsApi } from '../services/api';
import { SoilAnalysisResult, Farm } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  TestTube, Sparkles, AlertCircle, CheckCircle2,
  TrendingUp, Award, Layers, ArrowRight
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Badge } from '../components/Badge';

export const SoilAnalysisPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);

  const [formData, setFormData] = useState({
    nitrogen: 88.0,
    phosphorus: 44.0,
    potassium: 42.0,
    ph: 6.6,
    moisture: 48.0,
    temperature: 24.0,
    soil_type: 'Loamy'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await farmsApi.getAll();
        setFarms(data);
        if (data.length > 0) setSelectedFarmId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarms();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await soilApi.analyze({
        farm_id: selectedFarmId,
        ...formData
      });
      setResult(data);
      addToast('success', `Soil Health Score: ${data.health_score}/100`);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Soil analysis failed.');
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
            <span>Soil Fertility Scoring & Macronutrient Balance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.soilAnalysis}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculate your soil health score (0-100), identify macronutrient deficiencies, and get soil amendment advice.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Selected Plot:</span>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
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
            <TestTube className="w-5 h-5 text-forest-600" />
            Enter Soil Test Lab Values
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil pH (0-14)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="12.0"
                  required
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 7 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Moisture (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  required
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: parseFloat(e.target.value) || 45 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Texture Class</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
              >
                <option value="Loamy">Loamy Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Black">Black Soil (Vertisols)</option>
                <option value="Clay">Clayey Soil</option>
                <option value="Sandy">Sandy Loam</option>
                <option value="Red">Red Soil</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Evaluating Soil Metrics...' : 'Compute Soil Health Index'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Results & Health Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <LoadingSkeleton rows={6} />
            </div>
          ) : result ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 animate-in fade-in">
              {/* Health Score Gauge Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-forest-800 to-emerald-900 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Soil Health Card
                  </span>
                  <h2 className="text-3xl font-black mt-1">{result.health_score} / 100</h2>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{result.overall_rating}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold border border-white/20">
                  🌱
                </div>
              </div>

              {/* Parameter Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Macronutrient & Chemical Status Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.parameters).map(([paramName, p]) => (
                    <div key={paramName} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">{paramName}</span>
                        <Badge variant={p.status === 'Optimal' ? 'success' : p.status === 'Low' ? 'warning' : 'info'}>
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-black text-slate-900">
                        {p.value} <span className="text-[11px] font-normal text-slate-500">{p.unit}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Ideal: {p.ideal_range}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Agronomic Amendments & Biofertilizers
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-forest-50/70 border border-forest-100">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suitable Crops */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Suitable Crops for This Soil Profile:
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.suitable_crops.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center py-20">
              <TestTube className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Soil Test Analyzed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Fill in the soil test values and click "Compute Soil Health Index" to view fertility status.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
