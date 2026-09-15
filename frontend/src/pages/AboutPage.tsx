import React from 'react';
import { Sprout, Award, Target, Users, BookOpen, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-600">About the Project</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">AgriSmart AI Initiative</h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            A B.Tech Final-Year Computer Science and Engineering Capstone Project dedicated to bridging the digital divide in Indian agriculture through Artificial Intelligence and Edge Telemetry.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center mb-4 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Project Mission</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Empower smallholder farmers in regions like Punjab, Haryana, and Uttar Pradesh with scientific decision support to counter declining water tables and soil degradation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Academic Rigor</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Built on genuine Machine Learning classifiers, botanical computer vision feature extractors, and micro-meteorological APIs, not mocked frontends.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Accessibility First</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Designed with high-contrast UI, responsive mobile compatibility, and trilingual support (English, Hindi, Punjabi) for intuitive grassroots adoption.
            </p>
          </div>
        </div>

        {/* Technical Architecture Summary */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-forest-600" />
            Project Specifications & Evaluation Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Random Forest Crop Classifier</p>
              <p className="mt-1">95.7% accuracy across 23 crops (N, P, K, Temp, Humidity, pH, Rainfall).</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Computer Vision Leaf Pathology</p>
              <p className="mt-1">Botanical color-space segmentation diagnosing 10 disease categories.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Zero-Config Local Deployment</p>
              <p className="mt-1">SQLite development fallback with full PostgreSQL / Docker Compose compatibility.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Multi-Turn Trilingual Assistant</p>
              <p className="mt-1">Contextual AI chatbot operating in English, हिन्दी, and ਪੰਜਾਬੀ.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
