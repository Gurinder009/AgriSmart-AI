import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { authApi } from '../services/api';
import { User, Phone, Mail, Globe, Shield, Save, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { addToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authApi.updateProfile({
        name,
        phone,
        preferred_language: language,
      });
      updateUser(updated);
      addToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      addToast('error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">{t.profile}</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your agricultural operator credentials and contact details.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-black text-xl">
            {name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name || 'Farmer'}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Read-Only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { addToast } = useNotifications();
  const [telemetrySync, setTelemetrySync] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">System Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">Configure telemetry intervals and localization options.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Live IoT Telemetry Sync</h4>
              <p className="text-xs text-slate-500">Automatically poll latest ESP32 soil readings every 30 seconds</p>
            </div>
            <input
              type="checkbox"
              checked={telemetrySync}
              onChange={(e) => {
                setTelemetrySync(e.target.checked);
                addToast('info', `Telemetry Sync: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
              }}
              className="w-4 h-4 text-forest-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Push Alert Banners</h4>
              <p className="text-xs text-slate-500">Display instant toast popups when frost or dry soil is detected</p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => {
                setSoundAlerts(e.target.checked);
                addToast('info', `Alert Banners: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
              }}
              className="w-4 h-4 text-forest-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Application Language</h4>
              <p className="text-xs text-slate-500">Current active interface locale</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
