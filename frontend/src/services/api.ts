import axios from 'axios';
import {
  AuthResponse, RegisterResponse, Farm, SoilAnalysisResult,
  CropRecommendResult, DiseaseDetectionResult,
  IrrigationResult, FertilizerResult, WeatherData,
  ChatMessage, NotificationItem, DashboardData, AdminStats
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrismart_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then((res) => res.data),
  register: (data: { name: string; email: string; password: string; confirm_password?: string; phone?: string; preferred_language?: string; role?: string }) =>
    apiClient.post<RegisterResponse>('/auth/register', data).then((res) => res.data),
  getMe: () => apiClient.get('/auth/me').then((res) => res.data),
  updateProfile: (data: { name?: string; phone?: string; preferred_language?: string }) =>
    apiClient.put('/auth/profile', data).then((res) => res.data),
  resetPassword: (email: string, new_password: string) =>
    apiClient.post('/auth/reset-password', { email, new_password }).then((res) => res.data),
};


// Farms API
export const farmsApi = {
  getAll: () => apiClient.get<Farm[]>('/farms').then((res) => res.data),
  getById: (id: number) => apiClient.get<Farm>(`/farms/${id}`).then((res) => res.data),
  create: (farm: Partial<Farm>) => apiClient.post<Farm>('/farms', farm).then((res) => res.data),
  update: (id: number, farm: Partial<Farm>) => apiClient.put<Farm>(`/farms/${id}`, farm).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/farms/${id}`).then((res) => res.data),
  getTelemetry: (id: number) => apiClient.get(`/farms/${id}/telemetry`).then((res) => res.data),
};

// Crop ML API
export const cropApi = {
  recommend: (data: {
    farm_id?: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }) => apiClient.post<CropRecommendResult>('/crop/recommend', data).then((res) => res.data),
  getHistory: (farm_id?: number) =>
    apiClient.get('/crop/history', { params: { farm_id } }).then((res) => res.data),
};

// Disease CV API
export const diseaseApi = {
  predict: (file: File, farm_id?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (farm_id) formData.append('farm_id', farm_id.toString());
    return apiClient.post<DiseaseDetectionResult>('/disease/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  getHistory: (farm_id?: number) =>
    apiClient.get('/disease/history', { params: { farm_id } }).then((res) => res.data),
};

// Soil API
export const soilApi = {
  analyze: (data: {
    farm_id?: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    moisture: number;
    temperature?: number;
    soil_type?: string;
  }) => apiClient.post<SoilAnalysisResult>('/soil/analyze', data).then((res) => res.data),
  getHistory: (farm_id?: number) =>
    apiClient.get('/soil/history', { params: { farm_id } }).then((res) => res.data),
};

// Fertilizer API
export const fertilizerApi = {
  recommend: (data: {
    farm_id?: number;
    crop: string;
    soil_type: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    farm_area: number;
    area_unit: string;
  }) => apiClient.post<FertilizerResult>('/fertilizer/recommend', data).then((res) => res.data),
  getHistory: (farm_id?: number) =>
    apiClient.get('/fertilizer/history', { params: { farm_id } }).then((res) => res.data),
};

// Smart Irrigation API
export const irrigationApi = {
  recommend: (data: {
    farm_id?: number;
    soil_moisture: number;
    temperature: number;
    humidity: number;
    crop: string;
    rainfall_probability: number;
    recent_rainfall?: number;
    soil_type?: string;
    auto_weather_sync?: boolean;
  }) => apiClient.post<IrrigationResult>('/irrigation/recommend', data).then((res) => res.data),
  getHistory: (farm_id?: number) =>
    apiClient.get('/irrigation/history', { params: { farm_id } }).then((res) => res.data),
};

// Weather API
export const weatherApi = {
  getCurrent: (farm_id?: number, location?: string, lat?: number, lon?: number) =>
    apiClient.get<WeatherData>('/weather/current', { params: { farm_id, location, lat, lon } }).then((res) => res.data),
  getForecast: (farm_id?: number, location?: string, lat?: number, lon?: number) =>
    apiClient.get<WeatherData>('/weather/forecast', { params: { farm_id, location, lat, lon } }).then((res) => res.data),
};

// AI Chatbot API
export const chatApi = {
  sendMessage: (question: string, language: string) =>
    apiClient.post<ChatMessage>('/chat', { question, language }).then((res) => res.data),
  getHistory: () => apiClient.get<ChatMessage[]>('/chat/history').then((res) => res.data),
  clearHistory: () => apiClient.delete('/chat/clear').then((res) => res.data),
};

// Notifications API
export const notificationsApi = {
  getAll: () => apiClient.get<NotificationItem[]>('/notifications').then((res) => res.data),
  markRead: (id: number) => apiClient.put<NotificationItem>(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => apiClient.put('/notifications/read-all').then((res) => res.data),
};

// Analytics API
export const analyticsApi = {
  getDashboard: (farm_id?: number) =>
    apiClient.get<DashboardData>('/analytics/dashboard', { params: { farm_id } }).then((res) => res.data),
  getFarmAnalytics: (farm_id: number, days: number = 14) =>
    apiClient.get(`/analytics/farm/${farm_id}`, { params: { days } }).then((res) => res.data),
};

// Admin API
export const adminApi = {
  getStats: () => apiClient.get<AdminStats>('/admin/statistics').then((res) => res.data),
  getUsers: () => apiClient.get('/admin/users').then((res) => res.data),
  getFarms: () => apiClient.get('/admin/farms').then((res) => res.data),
  getPredictions: () => apiClient.get('/admin/predictions').then((res) => res.data),
};

// IoT Sensors API
export const sensorApi = {
  ingest: (data: {
    sensor_id: string;
    farm_id: number;
    moisture: number;
    temperature: number;
    humidity: number;
    ph?: number;
  }) => apiClient.post('/sensors/data', data).then((res) => res.data),
  getLatest: (farm_id: number) => apiClient.get(`/sensors/latest/${farm_id}`).then((res) => res.data),
  getUserFeed: () => apiClient.get('/sensors/user-feed').then((res) => res.data),
};

