import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout, ScanEye, TestTube, FlaskConical,
  Droplets, CloudSun, Bot, BarChart3, Bell, ArrowRight
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const modules = [
    {
      icon: Sprout,
      title: "AI Crop Recommendation",
      endpoint: "POST /api/crop/recommend",
      desc: "Analyzes soil N, P, K, pH along with meteorological factors (temperature, humidity, precipitation) through a trained Random Forest model to recommend the best-suited crop.",
      highlights: ["Confidence probability score", "Alternative runner-up crops", "Comprehensive crop agronomic calendar"]
    },
    {
      icon: ScanEye,
      title: "Leaf Disease Detection (CV)",
      endpoint: "POST /api/disease/predict",
      desc: "Computer vision analysis of uploaded foliage photographs. Inspects necrosis, chlorosis, and rust pustule distribution across leaf surfaces.",
      highlights: ["Validated MIME and 10MB limit", "Identifies Early/Late Blight, Rust, Blast", "Organic & chemical spray guidance"]
    },
    {
      icon: TestTube,
      title: "Soil Fertility Index & Analysis",
      endpoint: "POST /api/soil/analyze",
      desc: "Computes a weighted 0-100 soil health score across macronutrients (N, P, K), pH balance, and moisture retention capacity.",
      highlights: ["Acidic/Alkaline soil amendments", "Liming and gypsum recommendations", "Targeted crop suitability tags"]
    },
    {
      icon: FlaskConical,
      title: "Area-Scaled Fertilizer Advisor",
      endpoint: "POST /api/fertilizer/recommend",
      desc: "Computes exact NPK deficits and generates a commercial fertilizer schedule (Urea, DAP, MOP) calculated directly to your farm's acreage.",
      highlights: ["Prevents fertilizer over-expenditure", "Split top-dressing schedules", "Agricultural safety caveats"]
    },
    {
      icon: Droplets,
      title: "Smart Irrigation & Water Balance",
      endpoint: "POST /api/irrigation/recommend",
      desc: "Considers current soil moisture, evapotranspiration rates (ET0), and rainfall probabilities to issue YES/NO irrigation orders.",
      highlights: ["Conserves groundwater reserves", "Recommends time window (morning/dusk)", "Calculates water volume needed"]
    },
    {
      icon: CloudSun,
      title: "Weather Intelligence Engine",
      endpoint: "GET /api/weather/current",
      desc: "Provides current meteorological conditions and 7-day forecast with contextual agricultural advisories on spraying and weeding.",
      highlights: ["OpenWeatherMap integration", "Agricultural rain probability", "Farm-specific location lookup"]
    },
    {
      icon: Bot,
      title: "Trilingual AgriSmart Assistant",
      endpoint: "POST /api/chat",
      desc: "Interactive agricultural chatbot with multi-turn conversation memory, supporting queries in English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).",
      highlights: ["Organic pest control recipes", "Nutrient deficiency diagnosis", "Government schemes assistance"]
    },
    {
      icon: BarChart3,
      title: "Historical Trends & Telemetry",
      endpoint: "GET /api/analytics/dashboard",
      desc: "Interactive multi-axis Recharts visualizations charting 7-day soil moisture retention, ambient temperature curves, and disease history.",
      highlights: ["Farm-level filtering", "Sensor node telemetry", "Yield correlation metrics"]
    }
  ];

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-600">Complete Feature Catalog</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">AgriSmart AI Capabilities</h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Every feature is backed by fully functional FastAPI endpoints, SQLAlchemy database tables, and real machine learning pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{m.title}</h3>
                    </div>
                  </div>
                  <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mb-3">
                    {m.endpoint}
                  </code>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{m.desc}</p>
                  
                  <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                    {m.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-forest-600 hover:text-forest-700 flex items-center gap-1"
                  >
                    Try in App <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
