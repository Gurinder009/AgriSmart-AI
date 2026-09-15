import React, { useState, useEffect } from 'react';
import { analyticsApi, farmsApi } from '../services/api';
import { Farm } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3, Calendar, Filter, TrendingUp,
  Droplets, Thermometer, CloudRain, ShieldCheck, Sprout
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [days, setDays] = useState<number>(14);
  const [farmData, setFarmData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const farmList = await farmsApi.getAll();
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].id);
          fetchAnalytics(farmList[0].id, days);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const fetchAnalytics = async (farmId: number, rangeDays: number) => {
    setLoading(true);
    try {
      const data = await analyticsApi.getFarmAnalytics(farmId, rangeDays);
      setFarmData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmChange = (id: number) => {
    setSelectedFarmId(id);
    fetchAnalytics(id, days);
  };

  const handleDaysChange = (range: number) => {
    setDays(range);
    if (selectedFarmId) fetchAnalytics(selectedFarmId, range);
  };

  return (
    <div className="space-y-8">
      
      {/* Header with Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.analytics}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze historical soil moisture trends, temperature patterns, and irrigation cycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {farms.length > 0 && (
            <select
              value={selectedFarmId || ''}
              onChange={(e) => handleFarmChange(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>📍 {f.farm_name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleDaysChange(7)}
              className={`px-3 py-1.5 rounded-lg transition ${
                days === 7 ? 'bg-white text-forest-700 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleDaysChange(14)}
              className={`px-3 py-1.5 rounded-lg transition ${
                days === 14 ? 'bg-white text-forest-700 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => handleDaysChange(30)}
              className={`px-3 py-1.5 rounded-lg transition ${
                days === 30 ? 'bg-white text-forest-700 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {loading && !farmData ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200">
          <LoadingSkeleton rows={6} />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Main Chart: Soil Moisture vs Health Index */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Soil Moisture & Fertility Health Correlation
                </h3>
                <p className="text-xs text-slate-500">
                  Historical telemetry logged for {farmData?.farm_name || 'Selected Farm'}
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={farmData?.soil_history || []}>
                  <defs>
                    <linearGradient id="moistGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="moisture"
                    name="Moisture (%)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fill="url(#moistGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="health_score"
                    name="Health Score (/100)"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#healthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Soil N-P-K Evolution */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Nutrient Evolution (N, P, K in kg/ha)
              </h3>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={farmData?.soil_history || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '12px',
                        borderColor: '#e2e8f0'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="nitrogen" name="Nitrogen (N)" stroke="#16a34a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="phosphorus" name="Phosphorus (P)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="potassium" name="Potassium (K)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Irrigation & Disease History Log */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Recent Pathological Scans & Irrigation Decisions
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                {farmData?.disease_records && farmData.disease_records.length > 0 ? (
                  farmData.disease_records.map((d: any, idx: number) => (
                    <div key={idx} className="pt-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{d.disease}</span>
                        <span className="text-[10px] text-slate-400 block">{d.date}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {d.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-6 text-center">No disease events recorded</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
