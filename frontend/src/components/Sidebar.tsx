import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard, MapPin, Sprout, ScanEye,
  TestTube, FlaskConical, Droplets, CloudSun,
  Bot, BarChart3, Bell, User, Settings,
  ShieldCheck, X, Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      group: "Core Management",
      links: [
        { to: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
        { to: "/farms", icon: MapPin, label: t.farms },
      ]
    },
    {
      group: "AI Farming Modules",
      links: [
        { to: "/crop-recommendation", icon: Sprout, label: t.cropRecommendation, badge: "ML" },
        { to: "/disease-detection", icon: ScanEye, label: t.diseaseDetection, badge: "CV" },
        { to: "/soil-analysis", icon: TestTube, label: t.soilAnalysis },
        { to: "/fertilizer", icon: FlaskConical, label: t.fertilizer },
        { to: "/irrigation", icon: Droplets, label: t.smartIrrigation, badge: "IoT" },
        { to: "/weather", icon: CloudSun, label: t.weather },
      ]
    },
    {
      group: "Insights & AI Chat",
      links: [
        { to: "/assistant", icon: Bot, label: t.aiAssistant, highlight: true },
        { to: "/analytics", icon: BarChart3, label: t.analytics },
        { to: "/notifications", icon: Bell, label: t.notifications },
      ]
    },
    {
      group: "Account & Preferences",
      links: [
        { to: "/profile", icon: User, label: t.profile },
        { to: "/settings", icon: Settings, label: t.settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header / Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 lg:hidden">
          <span className="text-lg font-black text-slate-900">AgriSmart AI</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-forest-600 text-white shadow-md shadow-forest-700/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        } ${item.highlight ? 'ring-1 ring-emerald-500/30' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : item.highlight
                                  ? 'text-forest-600'
                                  : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.highlight && !item.badge && (
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Portal Section */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2">
                System Administration
              </p>
              <NavLink
                to="/admin"
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-amber-800 bg-amber-50/60 hover:bg-amber-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-200/80 text-amber-900">
                  ROOT
                </span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Farmer Quick Assist Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-xl bg-gradient-to-br from-forest-800 to-emerald-900 p-3.5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-300">IoT & AI Active</span>
            </div>
            <p className="text-xs font-semibold">AgriSmart AI Assistant</p>
            <p className="text-[11px] text-emerald-100/80 mt-0.5 leading-snug">
              Ask questions in English, Hindi, or Punjabi anytime.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
