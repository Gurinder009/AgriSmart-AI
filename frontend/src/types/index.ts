export type UserRole = 'farmer' | 'admin';
export type LanguageCode = 'en' | 'hi' | 'pa';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferred_language: LanguageCode;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
  access_token?: string;
}


export interface Farm {
  id: number;
  user_id: number;
  farm_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  area: number;
  area_unit: string;
  soil_type: string;
  current_crop?: string;
  created_at: string;
}

export interface ParameterStatus {
  value: number;
  unit: string;
  status: string;
  rating: string;
  ideal_range: string;
  recommendation: string;
}

export interface SoilAnalysisResult {
  id?: number;
  farm_id?: number;
  health_score: number;
  overall_rating: string;
  parameters: Record<string, ParameterStatus>;
  recommendations: string[];
  suitable_crops: string[];
  recorded_at: string;
}

export interface AlternativeCrop {
  crop: string;
  confidence: number;
}

export interface CropInfo {
  scientific_name: string;
  season: string;
  duration_days: string;
  soil_type: string;
  description: string;
  tips: string;
}

export interface CropRecommendResult {
  id?: number;
  recommended_crop: string;
  confidence: number;
  alternatives: AlternativeCrop[];
  crop_info: CropInfo;
  explanation: string;
  recorded_at?: string;
}

export interface DiseaseDetectionResult {
  id?: number;
  crop: string;
  disease: string;
  confidence: number;
  severity: string;
  is_healthy: boolean;
  symptoms: string;
  causes: string;
  organic_remedy: string;
  chemical_remedy: string;
  preventive_tips: string;
  disclaimer: string;
  image_url: string;
  metrics: {
    excess_green_index: number;
    necrotic_spot_coverage_pct: number;
    chlorosis_index_pct: number;
    texture_roughness: number;
  };
  created_at?: string;
}

export interface IrrigationResult {
  id?: number;
  irrigation_required: boolean;
  soil_moisture: number;
  water_stress_level: string;
  recommended_duration: string;
  water_volume: string;
  suggested_time_window: string;
  water_saving_tips: string[];
  reason: string;
  weather_source?: string;
  weather_summary?: {
    location?: string;
    temperature?: number;
    humidity?: number;
    rainfall_probability?: number;
    rainfall?: number;
    condition?: string;
    clouds?: number;
    data_source?: string;
  };
  created_at?: string;
}

export interface FertilizerItem {
  name: string;
  dose_per_unit: string;
  total_needed: string;
  application_stage: string;
}

export interface FertilizerResult {
  crop: string;
  deficiencies: string[];
  suggested_nutrient_focus: string;
  fertilizer_schedule: FertilizerItem[];
  organic_amendments: string[];
  application_considerations: string[];
  safety_warning: string;
}

export interface CurrentWeather {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon: string;
  rain_probability: number;
  uv_index: number;
  clouds?: number;
  pressure?: number;
  data_source?: string;
  timestamp: string;
}

export interface ForecastDay {
  date: string;
  day_name: string;
  temp_min: number;
  temp_max: number;
  condition: string;
  description: string;
  icon: string;
  rain_probability: number;
  humidity: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  agricultural_advisory: string;
  data_source?: string;
  fallback_reason?: string;
}

export interface ChatMessage {
  id?: number;
  question: string;
  answer: string;
  language: string;
  created_at?: string;
  disclaimer?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  summary: {
    total_farms: number;
    active_farm_id?: number;
    active_farm_name: string;
    current_crop: string;
    soil_type: string;
    farm_area: string;
    location: string;
    soil_health_score: number;
    soil_moisture: number;
    temperature: number;
    humidity: number;
    irrigation_status: string;
    disease_status: string;
    disease_severity: string;
    latest_recommendation: string;
    unread_notifications: number;
  };
  charts: {
    moisture_and_temp_trend: Array<{
      day: string;
      soil_moisture: number;
      temperature: number;
      rainfall: number;
    }>;
    crop_distribution: Array<{
      name: string;
      value: number;
    }>;
  };
}

export interface AdminStats {
  total_users: number;
  total_farmers: number;
  total_farms: number;
  total_crop_predictions: number;
  total_disease_scans: number;
  total_irrigation_evals: number;
  active_sensors: number;
  system_status: string;
}
