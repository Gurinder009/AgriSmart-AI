import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const { addToast } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@agrismart.local');
  const [password, setPassword] = useState('Demo@12345');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      addToast('success', 'Welcome back to AgriSmart AI!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to authenticate. Please check your email and password.';
      setErrorMsg(msg);
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'farmer' | 'admin') => {
    setLoading(true);
    setErrorMsg('');
    try {
      await quickDemoLogin(role);
      addToast('success', `Signed in as Demo ${role === 'farmer' ? 'Farmer' : 'Administrator'}`);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Demo login failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50/60 via-slate-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-forest-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-forest-600/25 group-hover:scale-105 transition-transform">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            AgriSmart <span className="text-forest-600">AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your farm portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access telemetry, ML recommendations, and weather intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@agrismart.local"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-forest-600 hover:text-forest-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : t.login}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              One-Click Review Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('farmer')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Demo Farmer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Demo Admin
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              Pre-configured accounts with realistic agricultural data for evaluation.
            </p>
          </div>

          <div className="text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-600 hover:text-forest-700">
              Register here
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
