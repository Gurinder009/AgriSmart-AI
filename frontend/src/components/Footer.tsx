import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-slate-900 tracking-tight">AgriSmart AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Intelligent precision agriculture system empowering Indian farmers with machine learning, weather forecasting, computer vision, and IoT telemetry.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              AI Tools
            </h4>
            <ul className="space-y-2">
              <li><Link to="/crop-recommendation" className="hover:text-forest-600 transition">Crop Recommendation AI</Link></li>
              <li><Link to="/disease-detection" className="hover:text-forest-600 transition">Plant Pathology Scan</Link></li>
              <li><Link to="/soil-analysis" className="hover:text-forest-600 transition">Soil Fertility Index</Link></li>
              <li><Link to="/irrigation" className="hover:text-forest-600 transition">Smart Irrigation Advisor</Link></li>
              <li><Link to="/weather" className="hover:text-forest-600 transition">Meteorological Advisory</Link></li>
            </ul>
          </div>

          {/* Languages & Support */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Supported Regions
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>Punjab (ਲੁਧਿਆਣਾ, ਜਲੰਧਰ, ਅੰਮ੍ਰਿਤਸਰ)</li>
              <li>Haryana (करनाल, हिसार, अम्बाला)</li>
              <li>Uttar Pradesh (मेरठ, वाराणसी)</li>
              <li>Maharashtra & Southern Agro Zones</li>
              <li className="text-forest-700 font-semibold mt-2">Available in English, हिन्दी, ਪੰਜਾਬੀ</li>
            </ul>
          </div>

          {/* Disclaimer & Project Meta */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Agricultural Notice
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              AgriSmart AI predictions are statistical decision aids. Always cross-verify chemical dosage recommendations with your local Krishi Vigyan Kendra (KVK) or State Agricultural University extension officers.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-[10px]">
                B.Tech Final Year Engineering Project
              </span>
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} AgriSmart AI. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Farmers
          </p>
        </div>
      </div>
    </footer>
  );
};
