export interface TranslationDict {
  // Navigation
  dashboard: string;
  farms: string;
  cropRecommendation: string;
  diseaseDetection: string;
  soilAnalysis: string;
  fertilizer: string;
  smartIrrigation: string;
  weather: string;
  aiAssistant: string;
  analytics: string;
  notifications: string;
  profile: string;
  settings: string;
  adminPortal: string;
  logout: string;
  login: string;
  register: string;
  
  // Dashboard & Metrics
  totalFarms: string;
  currentCrop: string;
  soilHealth: string;
  soilMoisture: string;
  temperature: string;
  humidity: string;
  irrigationStatus: string;
  diseaseStatus: string;
  latestRecommendation: string;
  quickActions: string;
  recentActivity: string;
  moistureTrend: string;
  
  // Actions & Buttons
  save: string;
  cancel: string;
  submit: string;
  analyzing: string;
  predictNow: string;
  addFarm: string;
  editFarm: string;
  deleteFarm: string;
  clearChat: string;
  markAllRead: string;
  downloadReport: string;
  
  // Agricultural terms
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  rainfall: string;
  confidence: string;
  recommendedDuration: string;
  waterSavings: string;
  organicRemedy: string;
  chemicalRemedy: string;
  disclaimer: string;
}

export const translations: Record<'en' | 'hi' | 'pa', TranslationDict> = {
  en: {
    dashboard: "Dashboard",
    farms: "My Farms",
    cropRecommendation: "Crop Recommendation",
    diseaseDetection: "Disease Detection",
    soilAnalysis: "Soil Health Analysis",
    fertilizer: "Fertilizer Advisor",
    smartIrrigation: "Smart Irrigation",
    weather: "Weather Intelligence",
    aiAssistant: "AgriSmart AI Bot",
    analytics: "Farm Analytics",
    notifications: "Alerts & Notifications",
    profile: "Farmer Profile",
    settings: "System Settings",
    adminPortal: "Admin Portal",
    logout: "Log Out",
    login: "Log In",
    register: "Register Account",
    
    totalFarms: "Total Farms",
    currentCrop: "Active Crop",
    soilHealth: "Soil Health Index",
    soilMoisture: "Soil Moisture",
    temperature: "Ambient Temp",
    humidity: "Relative Humidity",
    irrigationStatus: "Irrigation Status",
    diseaseStatus: "Disease Scan Status",
    latestRecommendation: "Top ML Recommendation",
    quickActions: "Quick Farm Operations",
    recentActivity: "Telemetry & Logs",
    moistureTrend: "7-Day Soil Moisture & Temp Trends",
    
    save: "Save Changes",
    cancel: "Cancel",
    submit: "Run Analysis",
    analyzing: "Processing with AI...",
    predictNow: "Predict Optimal Crop",
    addFarm: "Add New Farm",
    editFarm: "Edit Farm Details",
    deleteFarm: "Delete Farm",
    clearChat: "Clear Conversation",
    markAllRead: "Mark All as Read",
    downloadReport: "Download PDF Advisory",
    
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    rainfall: "Precipitation (mm)",
    confidence: "Model Confidence",
    recommendedDuration: "Suggested Run Duration",
    waterSavings: "Estimated Water Savings",
    organicRemedy: "Bio / Organic Treatment",
    chemicalRemedy: "Chemical Management",
    disclaimer: "AI prediction — verify with a local agricultural extension officer before application."
  },
  
  hi: {
    dashboard: "डैशबोर्ड",
    farms: "मेरे खेत",
    cropRecommendation: "फसल सिफारिश",
    diseaseDetection: "फसल रोग पहचान",
    soilAnalysis: "मृदा स्वास्थ्य विश्लेषण",
    fertilizer: "उर्वरक एवं खाद सलाह",
    smartIrrigation: "स्मार्ट सिंचाई",
    weather: "मौसम पूर्वानुमान",
    aiAssistant: "एग्रीस्मार्ट एआई सहायक",
    analytics: "कृषि आंकड़े",
    notifications: "सूचनाएं व अलर्ट",
    profile: "किसान प्रोफाइल",
    settings: "सेटिंग्स",
    adminPortal: "व्यवस्थापक पोर्टल",
    logout: "लॉग आउट",
    login: "लॉग इन",
    register: "नया खाता बनाएं",
    
    totalFarms: "कुल खेत",
    currentCrop: "वर्तमान फसल",
    soilHealth: "मिट्टी स्वास्थ्य स्कोर",
    soilMoisture: "मिट्टी की नमी",
    temperature: "तापमान",
    humidity: "हवा में नमी (आर्द्रता)",
    irrigationStatus: "सिंचाई स्थिति",
    diseaseStatus: "रोग स्कैन स्थिति",
    latestRecommendation: "शीर्ष एआई सिफारिश",
    quickActions: "त्वरित कार्य",
    recentActivity: "हालिया गतिविधियां",
    moistureTrend: "7 दिवसीय नमी एवं तापमान रुझान",
    
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    submit: "विश्लेषण शुरू करें",
    analyzing: "एआई द्वारा विश्लेषण जारी...",
    predictNow: "सही फसल का अनुमान लगाएं",
    addFarm: "नया खेत जोड़ें",
    editFarm: "खेत विवरण बदलें",
    deleteFarm: "खेत हटाएं",
    clearChat: "बातचीत मिटाएं",
    markAllRead: "सभी पढ़ी गईं चिह्नित करें",
    downloadReport: "सलाह रिपोर्ट डाउनलोड करें",
    
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटैशियम (K)",
    rainfall: "वर्षा (मिमी)",
    confidence: "मॉडल विश्वसनीयता",
    recommendedDuration: "सुझाई गई सिंचाई अवधि",
    waterSavings: "अनुमानित जल बचत",
    organicRemedy: "जैविक / देशी उपचार",
    chemicalRemedy: "रासायनिक उपचार",
    disclaimer: "एआई द्वारा दी गई सलाह — रासायनिक छिड़काव से पहले स्थानीय कृषि अधिकारी से पुष्टि करें।"
  },
  
  pa: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    farms: "ਮੇਰੇ ਖੇਤ",
    cropRecommendation: "ਫਸਲ ਦੀ ਸਿਫਾਰਸ਼",
    diseaseDetection: "ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ",
    soilAnalysis: "ਮਿੱਟੀ ਦੀ ਪਰਖ",
    fertilizer: "ਖਾਦ ਦੀ ਸਲਾਹ",
    smartIrrigation: "ਸਮਾਰਟ ਸਿੰਚਾਈ",
    weather: "ਮੌਸਮ ਜਾਣਕਾਰੀ",
    aiAssistant: "ਐਗਰੀਸਮਾਰਟ ਏਆਈ ਸਹਾਇਕ",
    analytics: "ਖੇਤੀਬਾੜੀ ਅੰਕੜੇ",
    notifications: "ਸੂਚਨਾਵਾਂ ਅਤੇ ਅਲਰਟ",
    profile: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
    settings: "ਸੈਟਿੰਗਾਂ",
    adminPortal: "ਐਡਮਿਨ ਪੋਰਟਲ",
    logout: "ਲਾਗ ਆਉਟ",
    login: "ਲਾਗ ਇਨ",
    register: "ਖਾਤਾ ਬਣਾਓ",
    
    totalFarms: "ਕੁੱਲ ਖੇਤ",
    currentCrop: "ਮੌਜੂਦਾ ਫਸਲ",
    soilHealth: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸਕੋਰ",
    soilMoisture: "ਮਿੱਟੀ ਦੀ ਨਮੀ",
    temperature: "ਤਾਪਮਾਨ",
    humidity: "ਹਵਾ ਵਿੱਚ ਨਮੀ",
    irrigationStatus: "ਸਿੰਚਾਈ ਸਥਿਤੀ",
    diseaseStatus: "ਰੋਗ ਜਾਂਚ ਸਥਿਤੀ",
    latestRecommendation: "ਮੁੱਖ ਏਆਈ ਸਿਫਾਰਸ਼",
    quickActions: "ਜ਼ਰੂਰੀ ਕਾਰਵਾਈਆਂ",
    recentActivity: "ਤਾਜ਼ਾ ਗਤੀਵਿਧੀਆਂ",
    moistureTrend: "7 ਦਿਨਾਂ ਦੇ ਨਮੀ ਅਤੇ ਤਾਪਮਾਨ ਦੇ ਰੁਝਾਨ",
    
    save: "ਸੇਵ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    submit: "ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ",
    analyzing: "ਏਆਈ ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ...",
    predictNow: "ਢੁਕਵੀਂ ਫਸਲ ਦਾ ਪਤਾ ਲਗਾਓ",
    addFarm: "ਨਵਾਂ ਖੇਤ ਜੋੜੋ",
    editFarm: "ਖੇਤ ਵਿੱਚ ਸੋਧ ਕਰੋ",
    deleteFarm: "ਖੇਤ ਮਿਟਾਓ",
    clearChat: "ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰੋ",
    markAllRead: "ਸਭ ਨੂੰ ਪੜ੍ਹਿਆ ਮਾਰਕ ਕਰੋ",
    downloadReport: "ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ",
    
    nitrogen: "ਨਾਈਟ੍ਰੋਜਨ (N)",
    phosphorus: "ਫਾਸਫੋਰਸ (P)",
    potassium: "ਪੋਟਾਸ਼ (K)",
    rainfall: "ਮੀਂਹ (ਮਿ.ਮੀ.)",
    confidence: "ਮਾਡਲ ਵਿਸ਼ਵਾਸ",
    recommendedDuration: "ਸਿੰਚਾਈ ਦਾ ਸਮਾਂ",
    waterSavings: "ਪਾਣੀ ਦੀ ਬੱਚਤ",
    organicRemedy: "ਜੈਵਿਕ ਇਲਾਜ",
    chemicalRemedy: "ਰਸਾਇਣਕ ਸਪਰੇਅ",
    disclaimer: "ਏਆਈ ਸਲਾਹ — ਰਸਾਇਣਕ ਸਪਰੇਅ ਤੋਂ ਪਹਿਲਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਦੀ ਰਾਏ ਲਵੋ।"
  }
};
