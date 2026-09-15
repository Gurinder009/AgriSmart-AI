import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { AdminStats } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Users, MapPin, Sprout, ScanEye,
  Activity, Server, Database, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Badge } from '../components/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'farms' | 'predictions'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsData, usersData, farmsData, predData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(),
          adminApi.getFarms(),
          adminApi.getPredictions()
        ]);
        setStats(statsData);
        setUsers(usersData);
        setFarms(farmsData);
        setPredictions(predData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">This portal requires platform administrator privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Root System Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">AgriSmart AI Administration</h1>
          <p className="text-xs text-amber-100/80 mt-1">
            Global system monitoring, farm registries, ML inferences audit, and sensor telemetry status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">All Services Operational</Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> System Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Registered Farmers ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('farms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'farms'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Field Registries ({farms.length})
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'predictions'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" /> Predictions Audit
        </button>
      </div>

      {loading ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200">
          <LoadingSkeleton rows={5} />
        </div>
      ) : activeTab === 'stats' && stats ? (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Platform Users"
              value={stats.total_users}
              subtitle={`${stats.total_farmers} Active Farmers`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Registered Farms"
              value={stats.total_farms}
              subtitle="Cultivated plots"
              icon={MapPin}
              color="emerald"
            />
            <StatCard
              title="Crop ML Inferences"
              value={stats.total_crop_predictions}
              subtitle="Model predictions"
              icon={Sprout}
              color="amber"
            />
            <StatCard
              title="Disease Scans"
              value={stats.total_disease_scans}
              subtitle="CV analyses logged"
              icon={ScanEye}
              color="rose"
            />
          </div>

          {/* Subsystem Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-forest-700 font-bold text-xs">
                <Server className="w-4 h-4" /> FastAPI Application Server
              </div>
              <p className="text-xl font-black text-slate-900">Uvicorn Core</p>
              <p className="text-xs text-slate-500">Listening on port 8000. REST endpoints responsive.</p>
              <Badge variant="success">Online</Badge>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
                <Database className="w-4 h-4" /> Database Engine
              </div>
              <p className="text-xl font-black text-slate-900">SQLAlchemy ORM</p>
              <p className="text-xs text-slate-500">Relational schema synced with SQLite / PostgreSQL.</p>
              <Badge variant="success">Connected</Badge>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Activity className="w-4 h-4" /> IoT Ingestion Gateway
              </div>
              <p className="text-xl font-black text-slate-900">{stats.active_sensors} Field Nodes</p>
              <p className="text-xs text-slate-500">ESP32 telemetry telemetry packet validation active.</p>
              <Badge variant="info">Ready</Badge>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">System Users Directory</h3>
            <span className="text-xs text-slate-400">{users.length} accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Farms</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{u.farm_count}</td>
                    <td className="p-4 uppercase font-semibold text-slate-500">{u.preferred_language}</td>
                    <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'farms' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">System-Wide Farm Registries</h3>
            <span className="text-xs text-slate-400">{farms.length} plots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Farm Name</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Soil Type</th>
                  <th className="p-4">Current Crop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farms.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{f.farm_name}</td>
                    <td className="p-4 text-slate-600">
                      <span className="font-semibold block">{f.owner_name}</span>
                      <span className="text-[10px] text-slate-400">{f.owner_email}</span>
                    </td>
                    <td className="p-4 text-slate-600">{f.location}</td>
                    <td className="p-4 font-bold text-slate-700">{f.area}</td>
                    <td className="p-4 text-slate-600">{f.soil_type}</td>
                    <td className="p-4 font-bold text-forest-700">{f.current_crop || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'predictions' && predictions ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Crop ML Recommendations</h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {predictions.crop_predictions.map((cp: any) => (
                <div key={cp.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 capitalize">{cp.recommended_crop}</span>
                    <span className="text-[10px] text-slate-400 ml-2">Rainfall: {cp.rainfall}mm</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">{cp.confidence}% confidence</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Disease Vision Scans</h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {predictions.disease_predictions.map((dp: any) => (
                <div key={dp.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{dp.disease}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({dp.crop})</span>
                  </div>
                  <Badge variant={dp.severity === 'High' ? 'danger' : 'warning'}>{dp.severity}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
};
