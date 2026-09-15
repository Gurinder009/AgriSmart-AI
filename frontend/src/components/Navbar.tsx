import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { LanguageCode } from '../types';
import {
  Sprout, Bell, Globe, User as UserIcon, LogOut,
  Menu, X, ShieldCheck, ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isDashboardLayout?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isDashboardLayout = false }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {isDashboardLayout && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                AgriSmart <span className="text-forest-600">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium tracking-wide text-slate-400 -mt-1 uppercase">
                Intelligent Smart Agriculture
              </span>
            </div>
          </Link>
        </div>

        {/* Public Desktop Navigation Links */}
        {!isDashboardLayout && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-forest-600 transition-colors">Home</Link>
            <Link to="/features" className="hover:text-forest-600 transition-colors">Features</Link>
            <Link to="/about" className="hover:text-forest-600 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-forest-600 transition-colors">Contact</Link>
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-forest-600" />
              <span className="uppercase font-semibold">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      setShowLangMenu(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition font-medium ${
                      language === item.code
                        ? 'bg-forest-50 text-forest-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.native}</span>
                    <span className="text-[10px] text-slate-400">{item.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated Controls */}
          {isAuthenticated ? (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Alerts</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-semibold text-forest-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifMenu(false)}
                        className="text-xs font-semibold text-forest-600 hover:text-forest-700"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No alerts at this moment
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                              !n.is_read ? 'bg-forest-50/30' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                              n.severity === 'alert' ? 'bg-rose-500' :
                              n.severity === 'warning' ? 'bg-amber-500' :
                              n.severity === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <Sprout className="w-4 h-4 text-forest-600" />
                      Farmer Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg my-0.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Admin Portal
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      {t.profile}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                {t.login}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-xl shadow-md shadow-forest-600/20 transition"
              >
                {t.register}
              </Link>
            </div>
          )}

          {/* Public Mobile Menu Toggle */}
          {!isDashboardLayout && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

        </div>
      </div>

      {/* Public Mobile Drawer */}
      {!isDashboardLayout && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Home</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Features</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Contact</Link>
        </div>
      )}
    </header>
  );
};
