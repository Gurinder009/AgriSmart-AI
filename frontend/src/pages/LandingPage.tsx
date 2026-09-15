import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout, ScanEye, TestTube, Droplets, CloudSun,
  Bot, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight,
  Sparkles, Layers, Cpu, HeartHandshake, HelpCircle,
  TrendingUp, Users, ChevronDown, Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDemoClick = async (role: 'farmer' | 'admin') => {
    await quickDemoLogin(role);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const features = [
    {
      icon: Sprout,
      title: "Crop Recommendation AI",
      desc: "Trained on 22+ Indian staple crops with real Random Forest ML pipeline factoring NPK, pH, moisture, and rainfall.",
      badge: "95.7% Accuracy",
      color: "emerald"
    },
    {
      icon: ScanEye,
      title: "Leaf Disease Detection",
      desc: "Computer vision image diagnostics identifying blights, rusts, and blasts from leaf photographs with organic remedies.",
      badge: "Real-Time CV",
      color: "rose"
    },
    {
      icon: Droplets,
      title: "Smart Irrigation Advisor",
      desc: "Estimates daily evapotranspiration and soil water depletion to conserve up to 35% irrigation groundwater.",
      badge: "Water Saving",
      color: "sky"
    },
    {
      icon: TestTube,
      title: "Soil Health Index",
      desc: "Automated 100-point soil fertility scoring with actionable chemical and bio-fertilizer dosage schedules.",
      badge: "NPK Balance",
      color: "amber"
    },
    {
      icon: CloudSun,
      title: "Weather Intelligence",
      desc: "7-day meteorological forecasts mapped directly to localized agricultural warnings and spray windows.",
      badge: "Live Forecast",
      color: "blue"
    },
    {
      icon: Bot,
      title: "AgriSmart AI Assistant",
      desc: "Conversational farming copilot answering pest, soil, and crop cultivation queries in English, Hindi, and Punjabi.",
      badge: "Trilingual",
      color: "purple"
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Input Soil & Climate Data",
      desc: "Connect your ESP32 IoT sensors or enter simple NPK, pH, and soil moisture values manually."
    },
    {
      step: "02",
      title: "Machine Learning Evaluation",
      desc: "Validated agronomic models and computer vision pipelines process your plot's exact micro-climate."
    },
    {
      step: "03",
      title: "Receive Targeted Prescription",
      desc: "Get specific crop matches, fertilizer dosage scaled to your acreage, and irrigation time windows."
    },
    {
      step: "04",
      title: "Optimize Yield & Water Usage",
      desc: "Prevent crop failure, minimize excess fertilizer expenditure, and conserve precious groundwater."
    }
  ];

  const faqs = [
    {
      q: "How does the Crop Recommendation model work?",
      a: "AgriSmart AI utilizes an optimized Random Forest classifier trained across 2,300+ scientific agricultural data points. It analyzes 7 environmental vectors (Nitrogen, Phosphorus, Potassium, Temperature, Humidity, Soil pH, and Rainfall) to output the best-performing crop alongside probability confidence scores."
    },
    {
      q: "Can I use AgriSmart AI in Hindi or Punjabi?",
      a: "Yes! AgriSmart AI has full native internationalization support. You can switch between English, हिन्दी, and ਪੰਜਾਬੀ instantly using the language toggle in the top bar."
    },
    {
      q: "Can real IoT sensors (like ESP32 or Arduino) connect to the platform?",
      a: "Absolutely. The system features a production-ready REST sensor ingestion endpoint at '/api/sensors/data' that accepts volumetric soil moisture, temperature, and humidity packets from any microcontroller."
    },
    {
      q: "Are the fertilizer recommendations tailored to my farm area?",
      a: "Yes. When you enter your farm acreage, AgriSmart AI calculates the exact nutrient deficit and specifies commercial bag quantities for Urea, DAP, and MOP tailored to your specific field size."
    }
  ];

  return (
    <div className="overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-forest-50/70 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#16a34a0a_1px,transparent_1px),linear-gradient(to_bottom,#16a34a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Intelligent Smart Agriculture System • B.Tech Final Year Engineering</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Smart Farming. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-700 via-emerald-600 to-teal-700">
              Better Decisions.
            </span> <br />
            Higher Productivity.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AgriSmart AI combines artificial intelligence, machine learning, weather intelligence, and IoT sensor technologies to empower Indian farmers with data-driven agronomic precision.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-lg shadow-forest-600/25 transition-all flex items-center gap-2 group"
              >
                Go to Farmer Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-lg shadow-forest-600/25 transition-all flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features"
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm"
                >
                  Explore Features
                </Link>
              </>
            )}

            {/* Quick One-Click Demo Review Buttons */}
            <div className="w-full sm:w-auto flex items-center justify-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => handleDemoClick('farmer')}
                className="px-4 py-3.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition flex items-center gap-1.5 shadow-sm"
                title="Instant login with demo farmer credentials"
              >
                🌾 Try Demo Farmer
              </button>
              <button
                onClick={() => handleDemoClick('admin')}
                className="px-4 py-3.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition flex items-center gap-1.5 shadow-sm"
                title="Instant login with demo admin credentials"
              >
                🛡️ Try Demo Admin
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200/60 pt-8">
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">23 Crops</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Trained ML Classification</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-forest-700">95.7%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Cross-Validation Score</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">3 Languages</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">English, हिन्दी, ਪੰਜਾਬੀ</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-forest-700">IoT-Ready</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">ESP32 Telemetry API</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-forest-600">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">How AgriSmart AI Works</h2>
            <p className="text-sm text-slate-600 mt-3">
              From raw soil metrics and leaf photos to actionable field management in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
                <span className="text-3xl font-black text-forest-600/30">{s.step}</span>
                <h3 className="text-base font-bold text-slate-900 mt-3">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI & SMART FEATURES */}
      <section className="py-20 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-forest-600">Modules</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              End-to-End Intelligent Agriculture Suite
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Engineered with modern algorithms to assist farmers in every phase of the cultivation cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COMPARISON / IMPACT SECTION */}
      <section className="py-20 bg-forest-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Precision vs Tradition
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
                Transforming Intuition into Precision Data
              </h2>
              <p className="text-sm text-emerald-100/80 mt-4 leading-relaxed">
                Traditional farming in India often relies on trial-and-error fertilizer applications, leading to groundwater pollution, soil degradation, and unnecessary expenses. AgriSmart AI replaces guesswork with agronomic data.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Soil-Specific NPK Balancing</h4>
                    <p className="text-xs text-emerald-100/70 mt-0.5">Calculates exact deficits to eliminate excessive urea overuse.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Water Balance Irrigation Intelligence</h4>
                    <p className="text-xs text-emerald-100/70 mt-0.5">Accounts for forecasted precipitation before advising pump operation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Integrated Multi-Lingual Assistant</h4>
                    <p className="text-xs text-emerald-100/70 mt-0.5">Farmers can comfortably ask questions in Punjabi or Hindi.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial / Demonstration Card */}
            <div className="p-8 rounded-3xl bg-forest-950/60 border border-emerald-500/20 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300">
                  GS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gurinderpal Singh</h4>
                  <p className="text-xs text-emerald-300">Wheat & Paddy Farmer, Ludhiana District</p>
                </div>
              </div>
              <blockquote className="text-sm text-slate-200 italic leading-relaxed">
                "Using the smart irrigation and disease scanning tools saved my wheat crop from severe brown rust last season. Having the chatbot respond directly in Punjabi made it effortless to share with my farming family."
              </blockquote>
              <div className="pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-200/70">
                <span>Verified Field Pilot</span>
                <span className="font-bold text-emerald-400">Yield Increase: +18%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-forest-600">Frequently Asked</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Questions & Answers</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-slate-100/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-forest-700 to-emerald-800 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Experience Intelligent Precision Agriculture?
          </h2>
          <p className="mt-3 text-sm text-emerald-100 max-w-xl mx-auto">
            Log in with the preloaded demonstration account or register your own farm to start monitoring right away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-white text-forest-800 text-sm font-bold hover:bg-slate-100 shadow-md transition"
            >
              Create Free Farmer Account
            </Link>
            <button
              onClick={() => handleDemoClick('farmer')}
              className="px-6 py-3.5 rounded-xl bg-forest-900/80 border border-emerald-400/50 text-white text-sm font-bold hover:bg-forest-900 transition"
            >
              One-Click Demo Login
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
