import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, farmsApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DashboardData, Farm } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Badge } from '../components/Badge';
import {
  MapPin, Sprout, Droplets, Thermometer,
  CloudSun, ScanEye, TestTube, ArrowUpRight,
  TrendingUp, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (farmId?: number) => {
    setLoading(true);
    try {
      const [dashData, farmList] = await Promise.all([
        analyticsApi.getDashboard(farmId),
        farmsApi.getAll()
      ]);
      setData(dashData);
      setFarms(farmList);
      if (!selectedFarmId && farmList.length > 0) {
        setSelectedFarmId(dashData.summary.active_farm_id || farmList[0].id);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedFarmId);
  }, [selectedFarmId]);

  const PIE_COLORS = ['#16a34a', '#0284c7', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Farm Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-600">
              Smart Precision Operations
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Farmer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time soil moisture, weather forecast, and AI agronomic telemetry
          </p>
        </div>

        {/* Farm Switcher Dropdown */}
        <div className="flex items-center gap-3">
          {farms.length > 0 && (
            <div className="relative">
              <select
                value={selectedFarmId || ''}
                onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-forest-500 focus:outline-none transition cursor-pointer"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    📍 {f.farm_name} ({f.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => fetchDashboard(selectedFarmId)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200">
              <LoadingSkeleton rows={2} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title={t.soilMoisture}
              value={data?.summary.soil_moisture ?? 45}
              unit="%"
              subtitle="Volumetric Water Content"
              icon={Droplets}
              color="blue"
              trend={{ value: "Stable", positive: true }}
            />
            <StatCard
              title={t.soilHealth}
              value={data?.summary.soil_health_score ?? 88}
              unit="/100"
              subtitle="Fertility Index"
              icon={TestTube}
              color="emerald"
              trend={{ value: "Optimal", positive: true }}
            />
            <StatCard
              title={t.temperature}
              value={data?.summary.temperature ?? 24}
              unit="°C"
              subtitle={`Humidity: ${data?.summary.humidity ?? 65}%`}
              icon={Thermometer}
              color="amber"
            />
            <StatCard
              title={t.irrigationStatus}
              value={data?.summary.irrigation_status ?? 'Adequate'}
              subtitle={data?.summary.irrigation_status === 'Required' ? 'Action needed' : 'Sufficient moisture'}
              icon={CloudSun}
              color={data?.summary.irrigation_status === 'Required' ? 'rose' : 'emerald'}
            />
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/crop-recommendation"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-forest-50 text-forest-600 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.cropRecommendation}</h4>
                  <p className="text-[10px] text-slate-400">Random Forest ML</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-forest-600" />
            </Link>

            <Link
              to="/disease-detection"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.diseaseDetection}</h4>
                  <p className="text-[10px] text-slate-400">Leaf Vision Scan</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            </Link>

            <Link
              to="/irrigation"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.smartIrrigation}</h4>
                  <p className="text-[10px] text-slate-400">Water Balance Calc</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
            </Link>

            <Link
              to="/assistant"
              className="p-4 rounded-2xl bg-gradient-to-r from-forest-700 to-emerald-800 text-white shadow-sm hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 text-white">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.aiAssistant}</h4>
                  <p className="text-[10px] text-emerald-100">Ask in Punjabi / Hindi</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white" />
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 7-Day Soil Moisture & Temp Trends */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    7-Day Soil Moisture & Ambient Temperature Trends
                  </h3>
                  <p className="text-xs text-slate-500">
                    Plot telemetry captured via IoT sensor node
                  </p>
                </div>
                <Badge variant="success">Live Synced</Badge>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.charts.moisture_and_temp_trend || []}>
                    <defs>
                      <linearGradient id="colorMoist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="soil_moisture"
                      name="Soil Moisture (%)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorMoist)"
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Farm Status & Agronomic Health Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Current Plot Status</h3>
                <p className="text-xs text-slate-500 mb-4">{data?.summary.active_farm_name}</p>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Active Crop:</span>
                    <span className="font-bold text-slate-900">{data?.summary.current_crop || 'Wheat'}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Soil Type:</span>
                    <span className="font-bold text-slate-900">{data?.summary.soil_type || 'Loamy'}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Field Area:</span>
                    <span className="font-bold text-slate-900">{data?.summary.farm_area || '5.5 acres'}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Latest Disease Scan:</span>
                    <Badge variant={data?.summary.disease_severity === 'High' ? 'danger' : data?.summary.disease_severity === 'Moderate' ? 'warning' : 'success'}>
                      {data?.summary.disease_status || 'Healthy'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Top Recommendation:</span>
                    <span className="font-bold text-forest-700 capitalize">
                      {data?.summary.latest_recommendation || 'Wheat'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-forest-700" />
                  <span className="text-xs font-bold text-forest-900">Agronomic Insight</span>
                </div>
                <p className="text-[11px] text-forest-800/90 leading-relaxed">
                  Soil nitrogen and phosphorus balance are optimal for active tillering. Maintain current irrigation frequency.
                </p>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
