import React, { useState, useEffect } from 'react';
import { weatherApi, farmsApi } from '../services/api';
import { WeatherData, Farm } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CloudSun, Wind, Droplets, Sun, CloudRain,
  MapPin, RefreshCw, AlertTriangle, Calendar, Info,
  Gauge, Cloud, Navigation, CheckCircle2, Key
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const WeatherPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (farmId?: number, locationQuery?: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const data = await weatherApi.getCurrent(farmId, locationQuery, lat, lon);
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Failed to fetch meteorological forecast.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      addToast('warning', 'Geolocation is not supported by your browser.');
      return;
    }
    addToast('info', 'Detecting your device GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedFarmId(undefined);
        fetchWeather(undefined, undefined, latitude, longitude);
      },
      (err) => {
        addToast('error', `Geolocation request denied or timed out: ${err.message}`);
      }
    );
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLocation.trim()) return;
    setSelectedFarmId(undefined);
    fetchWeather(undefined, customLocation.trim());
  };

  useEffect(() => {
    const init = async () => {
      try {
        const farmList = await farmsApi.getAll();
        setFarms(farmList);
        const initialFarmId = farmList.length > 0 ? farmList[0].id : undefined;
        setSelectedFarmId(initialFarmId);
        fetchWeather(initialFarmId);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const isLiveOpenWeather = (weatherData?.data_source || weatherData?.current?.data_source) === 'OpenWeatherMap';

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-600">
              Agri-Meteorological Intelligence
            </span>
            <span className={`w-2 h-2 rounded-full ${isLiveOpenWeather ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.weather}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hyper-local agricultural weather, spray safety advisories, and 7-day precipitation forecasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {farms.length > 0 && (
            <select
              value={selectedFarmId || ''}
              onChange={(e) => {
                const val = e.target.value;
                const id = val ? Number(val) : undefined;
                setSelectedFarmId(id);
                setCustomLocation('');
                fetchWeather(id);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 transition"
            >
              <option value="">Choose Farm...</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>📍 {f.farm_name} ({f.location})</option>
              ))}
            </select>
          )}

          <form onSubmit={handleLocationSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="City, State / Coordinates"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-36 sm:w-48 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
            >
              Search
            </button>
          </form>

          <button
            onClick={handleLocateMe}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Use Device GPS Location"
          >
            <Navigation className="w-4 h-4 text-sky-600" />
          </button>

          <button
            onClick={() => fetchWeather(selectedFarmId, customLocation || undefined)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Source Notice Banner */}
      {weatherData && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
            isLiveOpenWeather
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isLiveOpenWeather ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
              {isLiveOpenWeather ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Data Source:</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                  isLiveOpenWeather ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {weatherData.data_source || 'Simulation/Fallback'}
                </span>
                {isLiveOpenWeather && (
                  <span className="text-[11px] text-emerald-700 font-semibold">• Live Satellite & Ground Station Telemetry</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isLiveOpenWeather
                  ? 'Active real-time observations retrieved directly from OpenWeatherMap API for precision agronomic modeling.'
                  : weatherData.fallback_reason || 'Using intelligent deterministic agricultural simulation engine. Configure WEATHER_API_KEY in backend/.env to unlock real-time meteorological observations.'}
              </p>
            </div>
          </div>

          {!isLiveOpenWeather && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-[11px] shrink-0">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              <span>WEATHER_API_KEY="" in .env</span>
            </div>
          )}
        </div>
      )}

      {loading && !weatherData ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200">
          <LoadingSkeleton rows={5} />
        </div>
      ) : weatherData ? (
        <div className="space-y-8">
          
          {/* Current Conditions Big Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Background ambient badge */}
              <div className="absolute top-4 right-4 z-0">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border ${
                  isLiveOpenWeather
                    ? 'bg-emerald-500/25 border-emerald-300/40 text-emerald-100'
                    : 'bg-amber-500/25 border-amber-300/40 text-amber-100'
                }`}>
                  {isLiveOpenWeather ? '● Real-Time OpenWeatherMap' : '○ Simulation / Fallback'}
                </span>
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {weatherData.current.location}
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black mt-2">
                    {weatherData.current.temperature}°C
                  </h2>
                  <p className="text-sm text-sky-100 mt-1 capitalize">
                    {weatherData.current.description} • Feels like {weatherData.current.feels_like}°C
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mt-6 sm:mt-0">
                  {weatherData.current.icon ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`}
                      alt={weatherData.current.condition}
                      className="w-14 h-14 object-contain filter drop-shadow"
                      onError={(e) => {
                        // Fallback to lucide icon if OpenWeather icon fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <CloudSun className="w-12 h-12 text-amber-300" />
                  )}
                </div>
              </div>

              {/* Comprehensive Weather Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-6 border-t border-white/15 text-xs relative z-10">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Humidity</span>
                  <span className="text-base font-black text-white">{weatherData.current.humidity}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Wind Speed</span>
                  <span className="text-base font-black text-white">{weatherData.current.wind_speed} km/h</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Rain Prob.</span>
                  <span className="text-base font-black text-white">{weatherData.current.rain_probability}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Precipitation</span>
                  <span className="text-base font-black text-white">{weatherData.current.rainfall} mm</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Cloud Cover</span>
                  <span className="text-base font-black text-white">{weatherData.current.clouds ?? 0}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-sky-200 block text-[10px] uppercase font-bold">Pressure</span>
                  <span className="text-base font-black text-white">{weatherData.current.pressure ?? 1013} hPa</span>
                </div>
              </div>
            </div>

            {/* Contextual Agricultural Advisory */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3 text-forest-700 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  Agronomic Advisory
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Field Operations Guidance</h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {weatherData.agricultural_advisory}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">Foliar Spray Advisory:</span>
                <p className="text-[11px] text-emerald-800">
                  {weatherData.current.rain_probability < 35 && weatherData.current.wind_speed < 20
                    ? 'Optimal window for pesticide and foliar micronutrient applications today.'
                    : 'Caution: Postpone chemical spraying due to elevated rain probability or high wind drift risk.'}
                </p>
              </div>
            </div>

          </div>

          {/* Forecast Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-forest-600" />
                Agricultural Forecast Outlook
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                {isLiveOpenWeather ? 'Source: OpenWeatherMap 5-Day Outlook' : 'Source: Agro-Climatic Simulation'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-center">
              {weatherData.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-forest-200 hover:bg-forest-50/20 transition space-y-2"
                >
                  <span className="text-xs font-bold text-slate-800 uppercase block">{day.day_name}</span>
                  <span className="text-[10px] text-slate-400 block">{day.date.slice(5)}</span>
                  
                  <div className="py-2 flex justify-center">
                    {day.icon ? (
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                        alt={day.condition}
                        className="w-10 h-10 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <CloudSun className="w-8 h-8 text-amber-500 mx-auto" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-900">
                    <span>{day.temp_max}°</span>
                    <span className="text-slate-400 font-normal ml-1">{day.temp_min}°</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-sky-700 font-semibold flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    {day.rain_probability}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
