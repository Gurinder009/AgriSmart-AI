import React, { useState, useEffect } from 'react';
import { farmsApi } from '../services/api';
import { Farm } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin, Plus, Edit2, Trash2, Sprout,
  Calendar, Layers, CheckCircle2, X
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const FarmsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    latitude: 30.9,
    longitude: 75.8,
    area: 5.0,
    area_unit: 'acres',
    soil_type: 'Loamy',
    current_crop: 'Wheat'
  });

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const data = await farmsApi.getAll();
      setFarms(data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to fetch farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      farm_name: '',
      location: '',
      latitude: 30.9,
      longitude: 75.8,
      area: 5.0,
      area_unit: 'acres',
      soil_type: 'Loamy',
      current_crop: 'Wheat'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      farm_name: farm.farm_name,
      location: farm.location,
      latitude: farm.latitude || 30.9,
      longitude: farm.longitude || 75.8,
      area: farm.area,
      area_unit: farm.area_unit,
      soil_type: farm.soil_type,
      current_crop: farm.current_crop || 'Wheat'
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this farm and all associated telemetry?')) return;
    try {
      await farmsApi.delete(id);
      addToast('success', 'Farm removed successfully.');
      fetchFarms();
    } catch (err) {
      addToast('error', 'Failed to delete farm.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        await farmsApi.update(editingFarm.id, formData);
        addToast('success', 'Farm details updated successfully.');
      } else {
        await farmsApi.create(formData);
        addToast('success', 'New farm registered successfully.');
      }
      setModalOpen(false);
      fetchFarms();
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Failed to save farm.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.farms}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered agricultural plots, soil types, and active cultivation cycles.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.addFarm}
        </button>
      </div>

      {/* Farms List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200">
              <LoadingSkeleton rows={4} />
            </div>
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Farms Registered</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add your first field plot to begin tracking soil moisture and weather recommendations.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-forest-600 text-white text-xs font-bold"
          >
            Add Your Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center font-bold">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{farm.farm_name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {farm.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Area</span>
                    <span className="font-bold text-slate-800">{farm.area} {farm.area_unit}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Type</span>
                    <span className="font-bold text-slate-800">{farm.soil_type}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Crop</span>
                    <span className="font-bold text-forest-700">{farm.current_crop || 'None'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">IoT Node</span>
                    <span className="font-bold text-slate-800">ESP32 Linked</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(farm)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                  title="Edit Farm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(farm.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                  title="Delete Farm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editingFarm ? t.editFarm : t.addFarm}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="e.g. Green Valley Farm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / District</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Ludhiana, Punjab, India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Area</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                  >
                    <option value="Alluvial">Alluvial Soil</option>
                    <option value="Loamy">Loamy Soil</option>
                    <option value="Black">Black Soil (Regur)</option>
                    <option value="Clay">Clayey Soil</option>
                    <option value="Sandy">Sandy Loam</option>
                    <option value="Red">Red Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Planted Crop</label>
                  <input
                    type="text"
                    value={formData.current_crop}
                    onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
                    placeholder="e.g. Wheat, Rice, Cotton"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
