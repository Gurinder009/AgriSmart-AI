import React, { useState, useEffect } from 'react';
import { irrigationApi, farmsApi, weatherApi } from '../services/api';
import { IrrigationResult, Farm, WeatherData } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Droplets, Sparkles, Clock, AlertTriangle, CheckCircle2,
  Calendar, Layers, ArrowRight, History, ShieldAlert,
  RefreshCw, CloudSun, MapPin, Check
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Badge } from '../components/Badge';

export const SmartIrrigationPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [syncingWeather, setSyncingWeather] = useState(false);

  const [formData, setFormData] = useState({
    soil_moisture: 36.0,
    temperature: 28.0,
    humidity: 55.0,
    crop: 'Wheat',
    rainfall_probability: 15.0,
    recent_rainfall: 0.0,
    soil_type: 'Loamy'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const syncWeatherForFarm = async (farmId?: number) => {
    setSyncingWeather(true);
    try {
      const data = await weatherApi.getCurrent(farmId);
      setWeatherData(data);
      if (data && data.current) {
        setFormData((prev) => ({
          ...prev,
          temperature: data.current.temperature,
          humidity: data.current.humidity,
          rainfall_probability: data.current.rain_probability,
          recent_rainfall: data.current.rainfall
        }));
        const sourceLabel = (data.data_source || data.current.data_source) === 'OpenWeatherMap'
          ? 'OpenWeatherMap (Real-Time)'
          : 'Simulation/Fallback';
        addToast('success', `Synced weather from ${sourceLabel}: ${data.current.temperature}°C, ${data.current.humidity}% humidity.`);
      }
    } catch (err) {
      console.error('Weather sync error:', err);
      addToast('error', 'Could not sync live weather. Retaining manual values.');
    } finally {
      setSyncingWeather(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [farmList, hist] = await Promise.all([
          farmsApi.getAll(),
          irrigationApi.getHistory()
        ]);
        setFarms(farmList);
        setHistory(hist);
        if (farmList.length > 0) {
          const firstFarm = farmList[0];
          setSelectedFarmId(firstFarm.id);
          setFormData((prev) => ({
            ...prev,
            crop: firstFarm.current_crop || 'Wheat',
            soil_type: firstFarm.soil_type || 'Loamy'
          }));
          syncWeatherForFarm(firstFarm.id);
        } else {
          syncWeatherForFarm();
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
      const data = await irrigationApi.recommend({
        farm_id: selectedFarmId,
        auto_weather_sync: false, // Inputs already synced with real telemetry
        ...formData
      });
      setResult(data);
      addToast(
        data.irrigation_required ? 'warning' : 'success',
        `Irrigation Decision: ${data.irrigation_required ? 'REQUIRED' : 'STANDBY'}`
      );
      const hist = await irrigationApi.getHistory();
      setHistory(hist);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Failed to calculate irrigation schedule.');
    } finally {
      setLoading(false);
    }
  };

  const isLiveWeather = (weatherData?.data_source || weatherData?.current?.data_source) === 'OpenWeatherMap';

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Evapotranspiration & Water Balance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.smartIrrigation}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Determine whether irrigation is required based on root-zone moisture, rain probability, and real weather variables.
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
                    soil_type: found.soil_type || prev.soil_type
                  }));
                }
                syncWeatherForFarm(id);
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

      {/* Live Weather Telemetry Sync Bar */}
      {weatherData && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-emerald-50/40 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>Weather Telemetry: {weatherData.current.location}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  isLiveWeather
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-500 text-white'
                }`}>
                  {isLiveWeather ? 'OpenWeatherMap (Real-Time)' : 'Simulation / Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Current: <span className="font-bold text-slate-800">{weatherData.current.temperature}°C</span> • Humidity: <span className="font-bold text-slate-800">{weatherData.current.humidity}%</span> • Rain Chance: <span className="font-bold text-slate-800">{weatherData.current.rain_probability}%</span> • Condition: <span className="font-bold text-slate-800 capitalize">{weatherData.current.condition}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => syncWeatherForFarm(selectedFarmId)}
            disabled={syncingWeather}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${syncingWeather ? 'animate-spin' : ''}`} />
            <span>{syncingWeather ? 'Syncing...' : 'Sync Weather Telemetry'}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-600" />
              Field Water Status Inputs
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-bold">
              {isLiveWeather ? 'Live Synced' : 'Ready'}
            </span>
          </div>

          <form onSubmit={handleRecommend} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Crop</label>
                <input
                  type="text"
                  required
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  placeholder="Wheat, Rice, Maize..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Texture</label>
                <select
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="Loamy">Loamy</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black Soil</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy Loam</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Moisture (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  required
                  value={formData.soil_moisture}
                  onChange={(e) => setFormData({ ...formData, soil_moisture: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Ambient Temp (°C)</span>
                  {isLiveWeather && <span className="text-[9px] text-sky-600 font-bold">LIVE</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 25 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Humidity (%)</span>
                  {isLiveWeather && <span className="text-[9px] text-sky-600 font-bold">LIVE</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 50 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Rain Forecast (%)</span>
                  {isLiveWeather && <span className="text-[9px] text-sky-600 font-bold">LIVE</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.rainfall_probability}
                  onChange={(e) => setFormData({ ...formData, rainfall_probability: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Evaluating Water Balance...' : 'Calculate Irrigation Requirement'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Decision & Window Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <LoadingSkeleton rows={6} />
            </div>
          ) : result ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 animate-in fade-in">
              {/* Decision Badge Card */}
              <div
                className={`p-6 rounded-2xl text-white shadow-md flex items-center justify-between ${
                  result.irrigation_required
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600'
                    : 'bg-gradient-to-r from-forest-700 to-emerald-800'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                    Decision Status
                  </span>
                  <h2 className="text-3xl font-black mt-0.5">
                    {result.irrigation_required ? 'IRRIGATION REQUIRED' : 'NO IRRIGATION NEEDED'}
                  </h2>
                  <p className="text-xs text-white/90 mt-1">
                    Water Stress: {result.water_stress_level} • Telemetry Source: {result.weather_source || (isLiveWeather ? 'OpenWeatherMap (Real-Time)' : 'Simulation/Fallback')}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                  {result.irrigation_required ? '⚠️' : '💧'}
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Agronomic Rationale:</span>
                {result.reason}
              </div>

              {/* Operational Windows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Optimal Time Window
                  </span>
                  <p className="font-bold text-slate-900">{result.suggested_time_window}</p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" /> Volume / Duration
                  </span>
                  <p className="font-bold text-slate-900">{result.recommended_duration}</p>
                  <p className="text-[11px] text-slate-500">Estimate: {result.water_volume}</p>
                </div>
              </div>

              {/* Water Conservation Tips */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                  Groundwater Conservation & Water-Saving Measures
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  {result.water_saving_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-forest-50/50 border border-forest-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center py-20">
              <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Awaiting Soil Moisture Inputs</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Field water stress is computed using Hargreaves crop water loss factors combined with real weather variables.
              </p>
            </div>
          )}

          {/* Recent History */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-sky-600" />
                Recent Field Irrigation Log
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Crop</th>
                      <th className="pb-2 font-medium">Moisture</th>
                      <th className="pb-2 font-medium">Decision</th>
                      <th className="pb-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.slice(0, 5).map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 text-slate-500">{new Date(h.created_at).toLocaleDateString()}</td>
                        <td className="py-2.5 font-bold text-slate-800">{h.crop}</td>
                        <td className="py-2.5">{h.soil_moisture}%</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              h.irrigation_required
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {h.irrigation_required ? 'Required' : 'Standby'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">{h.recommended_duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
