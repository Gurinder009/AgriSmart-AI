import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell, CheckCheck, Filter, AlertTriangle,
  Droplets, CloudSun, ScanEye, CheckCircle2
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = filterCategory === 'all'
    ? notifications
    : notifications.filter((n) => n.category === filterCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'irrigation': return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'weather': return <CloudSun className="w-4 h-4 text-amber-600" />;
      case 'disease': return <ScanEye className="w-4 h-4 text-rose-600" />;
      default: return <Bell className="w-4 h-4 text-forest-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.notifications}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts triggered by IoT field sensors, weather forecasts, and plant pathology scans.
          </p>
        </div>

        <button
          onClick={() => markAllAsRead()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
        >
          <CheckCheck className="w-4 h-4 text-forest-600" />
          {t.markAllRead}
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'irrigation', 'weather', 'disease', 'soil'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filterCategory === cat
                ? 'bg-forest-600 text-white shadow-md shadow-forest-700/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Alerts Found</h3>
            <p className="text-xs text-slate-500 mt-1">All farm systems are normal and up to date.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition ${
                !item.is_read ? 'bg-forest-50/20 font-semibold' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-forest-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <Badge variant={item.severity === 'alert' ? 'danger' : item.severity === 'warning' ? 'warning' : 'info'}>
                {item.severity}
              </Badge>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
