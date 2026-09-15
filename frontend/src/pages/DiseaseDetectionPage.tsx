import React, { useState, useEffect } from 'react';
import { diseaseApi, farmsApi, SERVER_BASE_URL } from '../services/api';
import { DiseaseDetectionResult, Farm } from '../types';

import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ScanEye, Upload, X, AlertTriangle, ShieldCheck,
  CheckCircle2, Sparkles, FileText, Info, History
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Badge } from '../components/Badge';

export const DiseaseDetectionPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [farmList, hist] = await Promise.all([
          farmsApi.getAll(),
          diseaseApi.getHistory()
        ]);
        setFarms(farmList);
        setHistory(hist);
        if (farmList.length > 0) setSelectedFarmId(farmList[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleFileChange = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('error', 'Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'Image exceeds 10 MB limit.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      addToast('warning', 'Please select or capture a leaf photograph first.');
      return;
    }
    setLoading(true);
    try {
      const res = await diseaseApi.predict(selectedFile, selectedFarmId);
      setResult(res);
      addToast('success', `Scan complete: ${res.disease}`);
      const hist = await diseaseApi.getHistory();
      setHistory(hist);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Disease analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to load sample test images quickly for demonstration
  const handleLoadSample = async (sampleType: 'healthy' | 'blight' | 'rust') => {
    setLoading(true);
    try {
      const filename = `${sampleType}_leaf.jpg`;
      const resp = await fetch(`${SERVER_BASE_URL}/uploads/sample_leaves/${filename}`);
      if (!resp.ok) throw new Error('Sample fetch failed');
      const blob = await resp.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      handleFileChange(file);
      addToast('info', `Loaded sample ${sampleType} leaf image.`);
    } catch (err) {
      addToast('warning', 'Sample leaf image could not be loaded from backend.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Computer Vision Botanical Pathology Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.diseaseDetection}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload or capture foliage photographs to diagnose pathogens, assess severity, and receive treatment recipes.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Assign to Farm:</span>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.farm_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload & Preview Box (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ScanEye className="w-5 h-5 text-rose-600" />
              Upload Leaf Photograph
            </h3>

            {/* Dropzone or Preview */}
            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-forest-500 hover:bg-forest-50/20 transition cursor-pointer"
                onClick={() => document.getElementById('leaf-upload-input')?.click()}
              >
                <input
                  id="leaf-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to browse or drag & drop leaf picture
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG, or WebP (Max 10 MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 aspect-video max-h-72 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Leaf Preview"
                    className="object-contain w-full h-full"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
                >
                  <ScanEye className="w-4 h-4" />
                  {loading ? 'Analyzing Botanical Features...' : 'Analyze Leaf Pathology'}
                </button>
              </div>
            )}

            {/* Quick Demo Test Leaves */}
            <div className="border-t border-slate-100 pt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Or Test With Pre-Generated Samples:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLoadSample('healthy')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                >
                  🍃 Healthy Foliage
                </button>
                <button
                  onClick={() => handleLoadSample('blight')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
                >
                  🍂 Blighted Leaf Spot
                </button>
                <button
                  onClick={() => handleLoadSample('rust')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition"
                >
                  🍁 Brown Rust Pustules
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis & Recommendations (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <LoadingSkeleton rows={6} />
            </div>
          ) : result ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6 animate-in fade-in">
              {/* Top Diagnosis Header */}
              <div className="flex items-center justify-between">
                <Badge variant={result.is_healthy ? 'success' : result.severity === 'High' ? 'danger' : 'warning'}>
                  {result.severity} Severity
                </Badge>
                <span className="text-xs font-bold text-slate-600">
                  Confidence: <strong className="text-slate-900">{result.confidence}%</strong>
                </span>
              </div>

              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest-600">
                  Detected on {result.crop}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {result.disease}
                </h2>
              </div>

              {/* Symptoms & Causes */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Pathological Symptoms:</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {result.symptoms}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Environmental Triggers:</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {result.causes}
                  </p>
                </div>
              </div>

              {/* Treatment Protocols */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                  <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t.organicRemedy}
                  </h4>
                  <p className="text-emerald-900 leading-relaxed">{result.organic_remedy}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    {t.chemicalRemedy}
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{result.chemical_remedy}</p>
                </div>
              </div>

              {/* Mandatory Agricultural Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Notice:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center py-20">
              <ScanEye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Awaiting Leaf Upload</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Select an image on the left or click one of the sample leaves to run the diagnostic engine.
              </p>
            </div>
          )}

          {/* Past Scans History */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Previous Disease Scans
              </h3>
              <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto text-xs">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{h.disease}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({h.crop})</span>
                    </div>
                    <Badge variant={h.severity === 'High' ? 'danger' : 'warning'}>{h.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
