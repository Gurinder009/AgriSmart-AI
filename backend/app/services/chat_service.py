import os
import httpx
from app.config import settings

KNOWLEDGE_BASE = {
    "yellow_leaves": {
        "keywords": ["yellow", "yellowing", "पीले", "ਪੀਲੇ", "chlorosis", "pale"],
        "en": (
            "Yellowing leaves (chlorosis) usually indicate:\n"
            "1. **Nitrogen Deficiency**: Older lower leaves turn pale green to yellow first in a V-shaped pattern along the midrib. Remedy: Top-dress with urea or apply 2% urea foliar spray.\n"
            "2. **Overwatering / Poor Drainage**: Root suffocation impairs nutrient uptake. Remedy: Check soil moisture and clear field drainage channels.\n"
            "3. **Iron / Zinc Deficiency**: Young upper leaves turn yellow with green veins. Remedy: Foliar spray of Chelated Zinc (0.5g/L) or Ferrous Sulphate (1g/L).\n"
            "4. **Fungal Infection**: Check leaf underside for fungal powder or pustules (e.g., Rust or Downy Mildew)."
        ),
        "hi": (
            "पत्तियों का पीला पड़ना (क्लोरोसिस) आमतौर पर इन कारणों से होता है:\n"
            "1. **नाइट्रोजन की कमी**: पुरानी निचली पत्तियां पहले पीली पड़ती हैं। उपाय: यूरिया का छिड़काव (2%) या संतुलित खाद दें।\n"
            "2. **अधिक पानी / जलभराव**: जड़ों को हवा न मिलने से पौधे पोषक तत्व नहीं ले पाते। उपाय: खेत में पानी की निकासी सुनिश्चित करें।\n"
            "3. **जिंक या आयरन की कमी**: नई ऊपरी पत्तियां पीली और नसें हरी रहती हैं। उपाय: जिंक सल्फेट या चिलेटेड आयरन का छिड़काव करें।\n"
            "4. **फफूंद रोग**: पत्ती की निचली सतह पर फफूंद या धब्बे जांचें।"
        ),
        "pa": (
            "ਪੱਤਿਆਂ ਦਾ ਪੀਲਾ ਪੈਣਾ ਇਹਨਾਂ ਕਾਰਨਾਂ ਕਰਕੇ ਹੋ ਸਕਦਾ ਹੈ:\n"
            "1. **ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਘਾਟ**: ਹੇਠਲੇ ਪੁਰਾਣੇ ਪੱਤੇ ਪਹਿਲਾਂ ਪੀਲੇ ਪੈਂਦੇ ਹਨ। ਹੱਲ: ਯੂਰੀਆ ਦਾ 2% ਸਪਰੇਅ ਜਾਂ ਸੰਤੁਲਿਤ ਖਾਦ ਪਾਓ।\n"
            "2. **ਵਾਧੂ ਪਾਣੀ / ਜਲ-ਜਮਾਓ**: ਜੜ੍ਹਾਂ ਨੂੰ ਹਵਾ ਨਾ ਮਿਲਣ ਕਾਰਨ ਪੌਦਾ ਕਮਜ਼ੋਰ ਹੋ ਜਾਂਦਾ ਹੈ। ਹੱਲ: ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਠੀਕ ਕਰੋ।\n"
            "3. **ਜ਼ਿੰਕ ਜਾਂ ਲੋਹੇ ਦੀ ਘਾਟ**: ਨਵੇਂ ਉਪਰਲੇ ਪੱਤੇ ਪੀਲੇ ਪੈਂਦੇ ਹਨ। ਹੱਲ: ਜ਼ਿੰਕ ਸਲਫੇਟ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n"
            "4. **ਉੱਲੀ ਰੋਗ**: ਪੱਤਿਆਂ ਦੇ ਹੇਠਾਂ ਉੱਲੀ ਜਾਂ ਧੱਬੇ ਚੈੱਕ ਕਰੋ।"
        )
    },
    "soil_ph": {
        "keywords": ["ph", "acidic", "alkaline", "पीएच", "ਤੇਜ਼ਾਬੀ", "ਖਾਰੀ", "lime", "gypsum"],
        "en": (
            "**Managing Soil pH:**\n"
            "• **Ideal Range**: 6.0 to 7.5 for most crops.\n"
            "• **Low pH (Acidic < 6.0)**: Reduces availability of phosphorus, calcium, and magnesium. Remedy: Apply agricultural lime (calcium carbonate) or dolomite limestone 3-4 weeks prior to sowing.\n"
            "• **High pH (Alkaline / Saline > 8.0)**: Locks up micronutrients like iron, zinc, and manganese. Remedy: Apply agricultural gypsum (calcium sulphate) @ 250-500 kg/acre and incorporate green manure (Dhaincha)."
        ),
        "hi": (
            "**मिट्टी के पीएच (pH) का प्रबंधन:**\n"
            "• **आदर्श स्तर**: 6.0 से 7.5 अधिकांश फसलों के लिए उत्तम है।\n"
            "• **अम्लीय मिट्टी (pH < 6.0)**: फास्फोरस और कैल्शियम की उपलब्धता कम हो जाती है। उपाय: बुवाई से 3-4 सप्ताह पहले कृषि चूना (लाइम) डालें।\n"
            "• **क्षारीय मिट्टी (pH > 8.0)**: जिंक और लोहे की कमी हो जाती है। उपाय: खेत में जिप्सम डालें और ढैंचा जैसी हरी खाद मिलाएँ।"
        ),
        "pa": (
            "**ਮਿੱਟੀ ਦੇ pH ਦਾ ਪ੍ਰਬੰਧਨ:**\n"
            "• **ਸਹੀ ਪੱਧਰ**: 6.0 ਤੋਂ 7.5 ਜ਼ਿਆਦਾਤਰ ਫਸਲਾਂ ਲਈ ਢੁਕਵਾਂ ਹੈ।\n"
            "• **ਤੇਜ਼ਾਬੀ ਮਿੱਟੀ (pH < 6.0)**: ਬਿਜਾਈ ਤੋਂ 3-4 ਹਫ਼ਤੇ ਪਹਿਲਾਂ ਖੇਤੀਬਾੜੀ ਚੂਨਾ (ਲਾਈਮ) ਪਾਓ।\n"
            "• **ਖਾਰੀ / ਕੱਲਰ ਮਿੱਟੀ (pH > 8.0)**: ਖੇਤ ਵਿੱਚ ਜਿਪਸਮ ਪਾਓ ਅਤੇ ਜੰਤਰ (ਹਰੀ ਖਾਦ) ਵਾਹੋ ਤਾਂ ਜੋ ਖਾਰਾਪਨ ਘਟ ਸਕੇ।"
        )
    },
    "irrigation_time": {
        "keywords": ["irrigate", "irrigation", "water", "कब पानी", "ਪਾਣੀ ਕਦੋਂ", "ਸਿੰਚਾਈ", "सिंचाई"],
        "en": (
            "**Best Practices for Smart Irrigation:**\n"
            "1. **Timing**: Always irrigate during early morning (05:30 AM - 08:30 AM) or dusk to prevent 20-30% evaporation loss.\n"
            "2. **Critical Crop Stages**:\n"
            "   - Wheat: Crown Root Initiation (CRI - 21 days), Tillering, Boot, Flowering, Milk stage.\n"
            "   - Rice: Maintain saturation during transplanting; shallow standing water (2-3 cm) during tillering.\n"
            "   - Maize: Tasseling and silking stages are critical.\n"
            "3. **Check AgriSmart Smart Irrigation tab** for soil moisture and rain forecast recommendations."
        ),
        "hi": (
            "**स्मार्ट सिंचाई के मुख्य सुझाव:**\n"
            "1. **समय**: हमेशा सुबह जल्दी (05:30 से 08:30) या शाम को सिंचाई करें ताकि वाष्पीकरण से पानी का नुकसान न हो।\n"
            "2. **महत्वपूर्ण अवस्थाएं**:\n"
            "   - गेहूं: सीआरआई (CRI - 21 दिन पर), कल्ले फूटते समय, फूल आते समय, और दाना भरते समय।\n"
            "   - धान: कल्ले फूटते समय 2-3 सेमी पानी रखें।\n"
            "   - मक्का: नर मंजरी और भुट्टा बनते समय नमी जरूरी है।\n"
            "3. **एग्रीस्मार्ट स्मार्ट सिंचाई टैब** पर लाइव मिट्टी की नमी और बारिश का पूर्वानुमान देखें।"
        ),
        "pa": (
            "**ਸਮਾਰਟ ਸਿੰਚਾਈ ਦੇ ਜ਼ਰੂਰੀ ਨੁਕਤੇ:**\n"
            "1. **ਸਮਾਂ**: ਹਮੇਸ਼ਾ ਸਵੇਰੇ ਜਲਦੀ ਜਾਂ ਸ਼ਾਮ ਵੇਲੇ ਪਾਣੀ ਦਿਓ ਤਾਂ ਜੋ ਵਾਸ਼ਪੀਕਰਨ ਘੱਟ ਹੋਵੇ।\n"
            "2. **ਨਾਜ਼ੁਕ ਪੜਾਅ**:\n"
            "   - ਕਣਕ: ਪਹਿਲਾ ਪਾਣੀ (21 ਦਿਨਾਂ 'ਤੇ), ਫੁਟਾਰੇ ਵੇਲੇ, ਨਿਸਰਣ ਵੇਲੇ ਅਤੇ ਦੁੱਧਾ ਪੈਣ ਵੇਲੇ।\n"
            "   - ਝੋਨਾ: ਬੂਟਾ ਮਾਰਨ ਵੇਲੇ ਹਲਕਾ ਪਾਣੀ ਰੱਖੋ।\n"
            "3. **ਐਗਰੀਸਮਾਰਟ ਇਰੀਗੇਸ਼ਨ ਟੈਬ** ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਨਮੀ ਅਤੇ ਮੀਂਹ ਦਾ ਪੂਰਵ-ਅਨੁਮਾਨ ਜ਼ਰੂਰ ਵੇਖੋ।"
        )
    },
    "pest_disease": {
        "keywords": ["pest", "disease", "insect", "fungus", "कीड़ा", "बीमारी", "ਕੀੜਾ", "ਬਿਮਾਰੀ", "spray", "neem"],
        "en": (
            "**Integrated Pest & Disease Management (IPM):**\n"
            "1. **Organic / Botanical Control**: Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil (10,000 ppm @ 2-3 ml/L) for sucking pests (Aphids, Whiteflies, Jassids).\n"
            "2. **Biological Control**: Use Trichoderma viride @ 5g/L for soil-borne pathogens or Pseudomonas fluorescens.\n"
            "3. **Chemical Fungicide**: For blights and rusts, use Mancozeb 75% WP @ 2.5g/L or Propiconazole 25% EC @ 1ml/L at first symptom.\n"
            "4. Upload a leaf picture in **Disease Detection** for immediate AI scanning!"
        ),
        "hi": (
            "**एकीकृत कीट एवं रोग प्रबंधन (IPM):**\n"
            "1. **जैविक नियंत्रण**: रस चूसक कीटों (माहू, सफेद मक्खी) के लिए नीम तेल (2-3 मिली/लीटर) या 5% निंबोली का घोल छिड़कें।\n"
            "2. **जैव-फफूंदनाशी**: जड़ सड़न और उकठा रोग के लिए ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) का प्रयोग करें।\n"
            "3. **रासायनिक उपचार**: झुलसा या रतुआ रोग के लिए मैंकोजेब 75% WP (2.5 ग्राम/लीटर) या प्रोपिकोनाज़ोल (1 मिली/लीटर) छिड़कें।\n"
            "4. तुरंत पत्ते की तस्वीर खींचकर **Disease Detection** टैब में जांचें!"
        ),
        "pa": (
            "**ਕੀੜਿਆਂ ਅਤੇ ਬਿਮਾਰੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ:**\n"
            "1. **ਜੈਵਿਕ ਕੰਟਰੋਲ**: ਤੇਲੇ ਅਤੇ ਚਿੱਟੀ ਮੱਖੀ ਲਈ ਨਿੰਮ ਦੇ ਤੇਲ (2-3 ਮਿ.ਲੀ./ਲਿਟਰ) ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n"
            "2. **ਬਾਇਓ ਕੰਟਰੋਲ**: ਜੜ੍ਹਾਂ ਦੇ ਰੋਗਾਂ ਲਈ ਟ੍ਰਾਈਕੋਡਰਮਾ ਵਰਤੋ।\n"
            "3. **ਉੱਲੀਨਾਸ਼ਕ**: ਪੀਲੇ ਰਤੂਏ ਜਾਂ ਝੁਲਸ ਰੋਗ ਲਈ ਮੈਨਕੋਜ਼ੇਬ ਜਾਂ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ (ਟਿਲਟ 1 ਮਿ.ਲੀ./ਲਿਟਰ) ਦਾ ਸਪਰੇਅ ਕਰੋ।\n"
            "4. ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ ਲਈ ਪੱਤੇ ਦੀ ਫੋਟੋ **Disease Detection** ਟੈਬ ਵਿੱਚ ਅੱਪਲੋਡ ਕਰੋ!"
        )
    },
    "soil_health": {
        "keywords": ["soil", "organic", "fertility", "खाद", "मिट्टी", "ਮਿੱਟੀ", "ਗੋਬਰ", "fym", "compost"],
        "en": (
            "**Steps to Boost Soil Fertility & Organic Carbon:**\n"
            "1. Apply 4-5 tonnes of well-rotted Farmyard Manure (FYM) or 1-2 tonnes of Vermicompost per acre annually.\n"
            "2. Practice green manuring using Dhaincha (Sesbania) or Sunnhemp before paddy/wheat rotation.\n"
            "3. Stop burning crop residues (stubble). Incorporate straw back into the soil with a Super Seeder or Happy Seeder to preserve soil organic carbon (SOC).\n"
            "4. Inoculate seeds with Rhizobium and Phosphate Solubilizing Bacteria (PSB)."
        ),
        "hi": (
            "**मिट्टी की उर्वरता और जैविक कार्बन बढ़ाने के उपाय:**\n"
            "1. हर साल प्रति एकड़ 4-5 टन सड़ी हुई गोबर की खाद या 1-2 टन केंचुआ खाद (वर्मीकंपोस्ट) डालें।\n"
            "2. धान या गेहूं की बुवाई से पहले ढैंचा या सनई की हरी खाद खेत में दबाएँ।\n"
            "3. पराली या फसल अवशेष कभी न जलाएं। इन्हें खेत में मिलाकर मिट्टी का जैविक कार्बन (SOC) बढ़ाएं।\n"
            "4. बुवाई से पहले बीजों को राइजोबियम और पीएसबी (PSB) कल्चर से उपचारित करें।"
        ),
        "pa": (
            "**ਮਿੱਟੀ ਦੀ ਉਪਜਾਊ ਸ਼ਕਤੀ ਵਧਾਉਣ ਦੇ ਨੁਕਤੇ:**\n"
            "1. ਹਰ ਸਾਲ ਪ੍ਰਤੀ ਏਕੜ 4-5 ਟਨ ਰੂੜੀ ਖਾਦ ਜਾਂ ਵਰਮੀਕੰਪੋਸਟ ਪਾਓ।\n"
            "2. ਕਣਕ ਜਾਂ ਝੋਨੇ ਤੋਂ ਪਹਿਲਾਂ ਜੰਤਰ ਦੀ ਹਰੀ ਖਾਦ ਖੇਤ ਵਿੱਚ ਵਾਹੋ।\n"
            "3. ਪਰਾਲੀ ਜਾਂ ਰਹਿੰਦ-ਖੂੰਹਦ ਨੂੰ ਅੱਗ ਨਾ ਲਗਾਓ, ਸੁਪਰ ਸੀਡਰ ਨਾਲ ਖੇਤ ਵਿੱਚ ਹੀ ਵਾਹੋ ਤਾਂ ਜੋ ਜੈਵਿਕ ਕਾਰਬਨ ਵਧੇ।\n"
            "4. ਬੀਜਾਂ ਨੂੰ ਜੈਵਿਕ ਟੀਕਿਆਂ (ਰਾਈਜ਼ੋਬੀਅਮ/ਪੀ.ਐਸ.ਬੀ.) ਨਾਲ ਸੋਧ ਕੇ ਬੀਜੋ।"
        )
    },
    "fertilizer_guidance": {
        "keywords": ["fertilizer", "urea", "dap", "mop", "npk", "खाद", "यूरिया", "ਖਾਦ", "पोटाश", "ਡੀਏਪੀ"],
        "en": (
            "**Optimal Fertilizer Application Guidelines:**\n"
            "1. **Basal Dose**: Apply full dose of Phosphorus (DAP/SSP) and Potash (MOP) at the time of final field preparation or sowing.\n"
            "2. **Nitrogen (Urea)**: Split application into 2-3 doses (e.g. at sowing, first irrigation/tillering, and panicle initiation) to increase Nitrogen Use Efficiency (NUE) by 25-30%.\n"
            "3. **Micronutrients**: Soil test annually for Zinc (Zn) and Iron (Fe). Spray Zinc Sulphate (21% @ 5g/L) if chlorosis appears.\n"
            "4. Check the **Fertilizer Intelligence** tab on AgriSmart to compute exact kg requirements for your farm area!"
        ),
        "hi": (
            "**संतुलित खाद एवं उर्वरक प्रबंधन:**\n"
            "1. **बुवाई के समय (बेसल डोज)**: फास्फोरस (डीएपी/एसएसपी) और पोटाश (एमओपी) की पूरी मात्रा बुवाई के समय दें।\n"
            "2. **यूरिया का प्रयोग**: यूरिया को 2 से 3 किस्तों में बांटकर दें (बुवाई, पहली सिंचाई, और कल्ले फूटते समय)।\n"
            "3. **सूक्ष्म पोषक तत्व**: जिंक और सल्फर की कमी होने पर जिंक सल्फेट (5 ग्राम/लीटर) का छिड़काव करें।\n"
            "4. अपने खेत के क्षेत्रफल अनुसार सही मात्रा जानने के लिए **Fertilizer** टैब का उपयोग करें!"
        ),
        "pa": (
            "**ਖਾਦਾਂ ਦੀ ਸਹੀ ਵਰਤੋਂ ਦੇ ਨਿਯਮ:**\n"
            "1. **ਬਿਜਾਈ ਵੇਲੇ**: ਡੀ.ਏ.ਪੀ. ਅਤੇ ਪੋਟਾਸ਼ ਦੀ ਪੂਰੀ ਮਾਤਰਾ ਬਿਜਾਈ ਦੇ ਸਮੇਂ ਡਰਿੱਲ ਕਰੋ।\n"
            "2. **ਯੂਰੀਆ ਦੀ ਵਰਤੋਂ**: ਯੂਰੀਆ ਨੂੰ 2-3 ਕਿਸ਼ਤਾਂ ਵਿੱਚ ਪਾਓ (ਪਹਿਲੇ ਪਾਣੀ ਅਤੇ ਗੋਭ ਵੇਲੇ) ਤਾਂ ਜੋ ਖਾਦ ਬੇਕਾਰ ਨਾ ਜਾਵੇ।\n"
            "3. **ਜ਼ਿੰਕ ਦੀ ਘਾਟ**: ਪੱਤੇ ਪੀਲੇ ਪੈਣ 'ਤੇ 0.5% ਜ਼ਿੰਕ ਸਲਫੇਟ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n"
            "4. ਆਪਣੇ ਖੇਤ ਦੇ ਰਕਬੇ ਮੁਤਾਬਕ ਖਾਦ ਦੀ ਸਹੀ ਗਿਣਤੀ ਲਈ **Fertilizer** ਟੈਬ ਵੇਖੋ!"
        )
    },
    "crop_selection": {
        "keywords": ["crop", "grow", "recommend", "alluvial", "which crop", "फसल", "ਫਸਲ", "ਕਿਹੜੀ ਫਸਲ", "कौन सी फसल"],
        "en": (
            "**Crop Selection Advice:**\n"
            "• **Alluvial Loamy Soils (Indo-Gangetic Plains)**: Highly fertile. Ideal for Wheat, Rice, Mustard, Sugarcane, Maize, and Potato in rotation.\n"
            "• **Black Soils (Central/Western India)**: High moisture retention. Ideal for Cotton, Soybean, Chickpea, Sorghum, and Groundnut.\n"
            "• **Sandy / Light Soils**: Fast draining. Best suited for Pearl Millet (Bajra), Pulses (Moong/Urad), and Cluster Bean (Guar).\n"
            "• Use the **Crop Recommendation** tab to run our AI model using your exact soil NPK and rainfall values!"
        ),
        "hi": (
            "**फसल चयन के सुझाव:**\n"
            "• **जलोढ़ / दोमट मिट्टी**: अत्यंत उपजाऊ होती है। गेहूं, धान, मक्का, सरसों और गन्ने के लिए सर्वोत्तम है।\n"
            "• **काली मिट्टी**: नमी बनाए रखती है। कपास, सोयाबीन, चना और ज्वार के लिए आदर्श है।\n"
            "• **बलुई / हल्की मिट्टी**: बाजरा, मूंग, मोठ और ग्वार के लिए उपयुक्त है।\n"
            "• अपनी मिट्टी के NPK और मौसम के अनुसार सटीक फसल जानने के लिए **Crop Recommendation** टैब का उपयोग करें!"
        ),
        "pa": (
            "**ਫਸਲ ਦੀ ਚੋਣ ਬਾਰੇ ਸਲਾਹ:**\n"
            "• **ਦਰਿਆਈ / ਦੋਮਟ ਜ਼ਮੀਨ**: ਬਹੁਤ ਉਪਜਾਊ ਹੁੰਦੀ ਹੈ। ਕਣਕ, ਝੋਨਾ, ਮੱਕੀ, ਸਰ੍ਹੋਂ ਅਤੇ ਆਲੂ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ।\n"
            "• **ਕਾਲੀ ਮਿੱਟੀ**: ਨਰਮਾ, ਕਪਾਹ ਅਤੇ ਛੋਲਿਆਂ ਲਈ ਢੁਕਵੀਂ ਹੈ।\n"
            "• **ਹਲਕੀ / ਰੇਤਲੀ ਜ਼ਮੀਨ**: ਬਾਜਰਾ, ਮੂੰਗੀ ਅਤੇ ਗੁਆਰੇ ਲਈ ਚੰਗੀ ਹੈ।\n"
            "• ਆਪਣੀ ਮਿੱਟੀ ਦੇ NPK ਮੁਤਾਬਕ ਸਹੀ ਫਸਲ ਜਾਣਨ ਲਈ **Crop Recommendation** ਮਾਡਲ ਚਲਾਓ!"
        )
    }
}


DEFAULT_RESPONSES = {
    "en": (
        "Hello! I am your **AgriSmart AI Assistant**. I can assist you with:\n"
        "• **Crop Selection**: Best crops for your soil and weather profile.\n"
        "• **Plant Pathology**: Identifying symptoms like yellowing, spots, or wilting.\n"
        "• **Smart Irrigation**: Optimal watering schedules and moisture management.\n"
        "• **Fertilizer Guidance**: N-P-K dosages, organic compost, and soil pH corrections.\n\n"
        "Please ask any agricultural question or describe your farm challenge!"
    ),
    "hi": (
        "नमस्ते! मैं आपका **एग्रीस्मार्ट एआई कृषि सहायक** हूँ। मैं आपकी सहायता कर सकता हूँ:\n"
        "• **फसल चयन**: आपकी मिट्टी और मौसम के अनुसार सही फसल।\n"
        "• **रोग एवं कीट पहचान**: पीली पत्तियां, धब्बे या मुरझाना।\n"
        "• **सिंचाई सलाह**: पानी देने का सही समय और तरीका।\n"
        "• **खाद और उर्वरक**: यूरिया, डीएपी, पोटाश और जैविक खाद का सही अनुपात।\n\n"
        "कृपया अपनी खेती से संबंधित कोई भी प्रश्न पूछें!"
    ),
    "pa": (
        "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ **ਐਗਰੀਸਮਾਰਟ ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ** ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n"
        "• **ਫਸਲ ਦੀ ਚੋਣ**: ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਅਤੇ ਮੌਸਮ ਅਨੁਸਾਰ ਢੁਕਵੀਂ ਫਸਲ।\n"
        "• **ਬਿਮਾਰੀਆਂ ਤੇ ਕੀੜਿਆਂ ਦੀ ਰੋਕਥਾਮ**: ਪੱਤਿਆਂ ਦਾ ਪੀਲਾ ਪੈਣਾ, ਧੱਬੇ ਜਾਂ ਸੁੰਡੀ।\n"
        "• **ਸਿੰਚਾਈ ਸਲਾਹ**: ਫਸਲ ਨੂੰ ਪਾਣੀ ਕਦੋਂ ਅਤੇ ਕਿੰਨਾ ਦੇਣਾ ਹੈ।\n"
        "• **ਖਾਦਾਂ ਦਾ ਸੰਤੁਲਨ**: ਯੂਰੀਆ, ਡੀ.ਏ.ਪੀ. ਅਤੇ ਰੂੜੀ ਖਾਦ ਦੀ ਸਹੀ ਮਾਤਰਾ।\n\n"
        "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਖੇਤੀ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ!"
    )
}

class ChatService:
    def __init__(self):
        self.disclaimer = "AI Agricultural Advisory — Consult your local Krishi Vigyan Kendra (KVK) for localized chemical spray guidelines."
        
    async def get_response(self, question: str, language: str = "en") -> dict:
        lang = language.lower()
        if lang not in ["en", "hi", "pa"]:
            lang = "en"
            
        # If external LLM is configured, query it
        if settings.LLM_API_KEY:
            try:
                llm_ans = await self._query_llm(question, lang)
                if llm_ans:
                    return {"answer": llm_ans, "language": lang, "disclaimer": self.disclaimer}
            except Exception as e:
                print(f"[Chat Warning] LLM API call failed ({e}). Using agricultural knowledge base.")
                
        # Rule-based agronomic expert system
        q_lower = question.lower()
        for topic_key, data in KNOWLEDGE_BASE.items():
            for kw in data["keywords"]:
                if kw in q_lower:
                    answer = data.get(lang, data["en"])
                    return {"answer": answer, "language": lang, "disclaimer": self.disclaimer}
                    
        # Default helpful intro response
        answer = DEFAULT_RESPONSES.get(lang, DEFAULT_RESPONSES["en"])
        return {"answer": answer, "language": lang, "disclaimer": self.disclaimer}
        
    async def _query_llm(self, question: str, language: str) -> str:
        prompt = (
            f"You are AgriSmart Assistant, an empathetic, highly knowledgeable agricultural expert serving Indian farmers. "
            f"Answer the farmer's question accurately in {language} language. Keep instructions practical, actionable, "
            f"and emphasize organic control alongside safe fertilizer and irrigation practices.\n\n"
            f"Question: {question}"
        )
        # Placeholder for OpenAI / compatible endpoint if key is present
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

chat_service = ChatService()
