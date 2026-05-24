/**
 * Trauma AID - Production-Level Emergency Trauma Detection System
 * Apple-level Design | Navy Blue & White Theme
 * Built with React with Glassmorphism & Professional UI
 *
 * Features:
 * - Pages: Home, Camera, Result, Map, Chat
 * - AI Detection with Camera Feed
 * - Voice Guidance & Emergency Instructions
 * - Hospital Finder with Phone Numbers
 * - Intelligent Chatbot Assistant
 * - Real Location-based Services
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design Tokens - Apple Navy & White Theme ────────────────────────────────
const COLORS = {
  critical: { bg: "#001a33", accent: "#ff3b30", glow: "rgba(255,59,48,0.25)", text: "#ff9999", badge: "#330d0d" },
  moderate: { bg: "#001f33", accent: "#ff9500", glow: "rgba(255,149,0,0.25)", text: "#ffb84d", badge: "#331a0d" },
  low: { bg: "#001a1a", accent: "#00cc88", glow: "rgba(0,204,136,0.25)", text: "#66dd99", badge: "#0d3326" },
};

// Navy Blue & White Apple-inspired palette
const APPLE_COLORS = {
  primary: "#0a0e27",      // Deep navy background
  secondary: "#1a1f3a",    // Navy card background
  accent: "#0066ff",       // Apple blue
  accentLight: "#3399ff",  // Light Apple blue
  text: "#ffffff",         // White text
  textSecondary: "#a0a0a0", // Light gray text
  separator: "#333333",    // Subtle separator
  success: "#00cc88",      // Green
  warning: "#ff9500",      // Orange
  error: "#ff3b30",        // Red
};

// ─── Mock API Service with Hospital Data ──────────────────────────────────────
const MOCK_RESPONSES = [
  {
    injury: "Severe Laceration",
    severity: "CRITICAL",
    confidence: 94,
    region: "Upper Limb",
    instructions: [
      "Apply firm, direct pressure to the wound immediately",
      "Use a clean cloth or sterile bandage — do not remove once soaked",
      "Elevate the limb above heart level if possible",
      "Call 112 / emergency services immediately",
      "Monitor for signs of shock: pale skin, rapid breathing, confusion",
    ],
  },
  {
    injury: "Head Trauma",
    severity: "CRITICAL",
    confidence: 89,
    region: "Cranial",
    instructions: [
      "Do NOT move the person — suspect spinal injury",
      "Keep the airway clear and open",
      "Do not remove any object embedded in the skull",
      "Watch for loss of consciousness, vomiting, or unequal pupils",
      "Call emergency services immediately and stay on the line",
    ],
  },
  {
    injury: "Minor Contusion",
    severity: "LOW",
    confidence: 97,
    region: "Lower Extremity",
    instructions: [
      "Apply ice wrapped in cloth to the area for 20 minutes",
      "Rest the injured area and avoid putting weight on it",
      "Elevate the limb to reduce swelling",
      "Take over-the-counter pain relief if needed",
      "Seek medical attention if pain worsens within 48 hours",
    ],
  },
  {
    injury: "Burn Injury",
    severity: "MODERATE",
    confidence: 91,
    region: "Torso",
    instructions: [
      "Cool the burn with cool (not cold) running water for 10-20 minutes",
      "Do NOT use ice, butter, or toothpaste",
      "Cover loosely with a sterile non-fluffy dressing",
      "Do not pop any blisters that form",
      "Seek professional medical care — burns are prone to infection",
    ],
  },
];

// Real Indian Hospitals Database with GPS coordinates for distance calculation
const REAL_HOSPITALS = [
  // Delhi NCR
  {
    name: "Apollo Hospitals Delhi",
    lat: 28.5692,
    lng: 77.2292,
    city: "Delhi",
    type: "Level 1 Trauma Center",
    phone: "+91-11-4660-5000",
    address: "Mathura Road, New Delhi 110024",
    rating: 4.9
  },
  {
    name: "Fortis Hospital Noida",
    lat: 28.5923,
    lng: 77.3585,
    city: "Noida",
    type: "Emergency Trauma Center",
    phone: "+91-120-647-0000",
    address: "B-22, Sector 62, NOIDA 201301",
    rating: 4.8
  },
  {
    name: "Max Super Specialty Hospital",
    lat: 28.5244,
    lng: 77.1855,
    city: "Delhi",
    type: "Emergency Department",
    phone: "+91-11-6766-0000",
    address: "Saket, New Delhi 110017",
    rating: 4.7
  },
  {
    name: "Sir Ganga Ram Hospital",
    lat: 28.6564,
    lng: 77.2197,
    city: "Delhi",
    type: "Government Hospital",
    phone: "+91-11-4141-0000",
    address: "Old Rajendra Nagar, New Delhi 110060",
    rating: 4.6
  },
  {
    name: "Medanta - The Medicity",
    lat: 28.4595,
    lng: 77.0832,
    city: "Gurgaon",
    type: "Multi-Specialty Hospital",
    phone: "+91-124-413-5000",
    address: "Sector 38, Gurgaon 122001",
    rating: 4.8
  },
  // Mumbai
  {
    name: "Lilavati Hospital",
    lat: 19.0176,
    lng: 72.8298,
    city: "Mumbai",
    type: "Level 1 Trauma Center",
    phone: "+91-22-6763-0000",
    address: "Bandra, Mumbai 400050",
    rating: 4.8
  },
  {
    name: "Grant Medical College Hospital",
    lat: 18.9676,
    lng: 72.8194,
    city: "Mumbai",
    type: "Government Hospital",
    phone: "+91-22-2169-8585",
    address: "Fort, Mumbai 400001",
    rating: 4.5
  },
  {
    name: "Bombay Hospital",
    lat: 18.9654,
    lng: 72.8254,
    city: "Mumbai",
    type: "Emergency Trauma Center",
    phone: "+91-22-2206-7676",
    address: "Marine Lines, Mumbai 400021",
    rating: 4.7
  },
  {
    name: "Kokilaben Hospital",
    lat: 19.0123,
    lng: 72.8456,
    city: "Mumbai",
    type: "Multi-Specialty Hospital",
    phone: "+91-22-3091-3000",
    address: "Navi Mumbai 400614",
    rating: 4.8
  },
  // Bangalore
  {
    name: "Apollo Hospitals Bangalore",
    lat: 13.1939,
    lng: 77.6969,
    city: "Bangalore",
    type: "Level 1 Trauma Center",
    phone: "+91-80-4000-3000",
    address: "Koramangala, Bangalore 560034",
    rating: 4.9
  },
  {
    name: "Fortis Hospital Bangalore",
    lat: 13.1939,
    lng: 77.5945,
    city: "Bangalore",
    type: "Emergency Trauma Center",
    phone: "+91-80-6121-0000",
    address: "Whitefield, Bangalore 560048",
    rating: 4.8
  },
  {
    name: "Manipal Hospital",
    lat: 13.1836,
    lng: 77.5961,
    city: "Bangalore",
    type: "Multi-Specialty Hospital",
    phone: "+91-80-4122-4444",
    address: "Whitefield, Bangalore 560066",
    rating: 4.7
  },
  // Hyderabad
  {
    name: "Apollo Hospitals Hyderabad",
    lat: 17.3850,
    lng: 78.4867,
    city: "Hyderabad",
    type: "Level 1 Trauma Center",
    phone: "+91-40-4444-4444",
    address: "Jubilee Hills, Hyderabad 500033",
    rating: 4.9
  },
  {
    name: "CARE Hospitals",
    lat: 17.4014,
    lng: 78.4744,
    city: "Hyderabad",
    type: "Emergency Trauma Center",
    phone: "+91-40-3898-5555",
    address: "Hitec City, Hyderabad 500081",
    rating: 4.8
  },
  // Chennai
  {
    name: "Apollo Hospitals Chennai",
    lat: 12.9725,
    lng: 80.2431,
    city: "Chennai",
    type: "Level 1 Trauma Center",
    phone: "+91-44-2829-0200",
    address: "Greames Road, Chennai 600006",
    rating: 4.9
  },
  {
    name: "Fortis Malar Hospital",
    lat: 13.0499,
    lng: 80.2247,
    city: "Chennai",
    type: "Emergency Trauma Center",
    phone: "+91-44-4228-6666",
    address: "Adyar, Chennai 600020",
    rating: 4.8
  },
  {
    name: "Stanley Medical College Hospital",
    lat: 13.1060,
    lng: 80.2969,
    city: "Chennai",
    type: "Government Hospital",
    phone: "+91-44-2536-3636",
    address: "George Town, Chennai 600001",
    rating: 4.5
  },
  // Pune
  {
    name: "Apollo Hospitals Pune",
    lat: 18.5204,
    lng: 73.8567,
    city: "Pune",
    type: "Level 1 Trauma Center",
    phone: "+91-20-2705-0000",
    address: "Kalyani Nagar, Pune 411014",
    rating: 4.8
  },
  {
    name: "Ruby Hall Clinic",
    lat: 18.5333,
    lng: 73.8167,
    city: "Pune",
    type: "Emergency Trauma Center",
    phone: "+91-20-6630-0000",
    address: "Camp, Pune 411001",
    rating: 4.7
  },
  // Kolkata
  {
    name: "AMRI Hospital",
    lat: 22.5726,
    lng: 88.3639,
    city: "Kolkata",
    type: "Level 1 Trauma Center",
    phone: "+91-33-4000-2000",
    address: "Dhakuria, Kolkata 700031",
    rating: 4.8
  },
  {
    name: "Apollo Gleneagles Hospital",
    lat: 22.5254,
    lng: 88.3748,
    city: "Kolkata",
    type: "Multi-Specialty Hospital",
    phone: "+91-33-2320-3040",
    address: "Alipore, Kolkata 700027",
    rating: 4.8
  },
  // Tamil Nadu - Suburban & nearby areas
  {
    name: "Vedavati Hospital Kanchipuram",
    lat: 12.8340,
    lng: 79.7029,
    city: "Kanchipuram",
    type: "Multi-Specialty Hospital",
    phone: "+91-44-2772-2772",
    address: "Kanchipuram 631501",
    rating: 4.5
  },
  {
    name: "Sri Ramakrishna Hospital",
    lat: 12.8210,
    lng: 79.7345,
    city: "Kanchipuram",
    type: "Emergency Trauma Center",
    phone: "+91-44-2752-3333",
    address: "Kanchipuram 631501",
    rating: 4.6
  },
  {
    name: "Kauvery Hospital Tiruvallur",
    lat: 13.1305,
    lng: 79.9147,
    city: "Tiruvallur",
    type: "Multi-Specialty Hospital",
    phone: "+91-44-4294-1111",
    address: "Tiruvallur 631604",
    rating: 4.7
  },
  {
    name: "Saveetha Medical College Hospital",
    lat: 12.7674,
    lng: 80.1614,
    city: "Kanchipuram",
    type: "Level 1 Trauma Center",
    phone: "+91-44-4734-4734",
    address: "Chengalpattu 603102",
    rating: 4.6
  },
  {
    name: "CMC Hospital Chengalpattu",
    lat: 12.6752,
    lng: 79.9688,
    city: "Chengalpattu",
    type: "Emergency Trauma Center",
    phone: "+91-44-2745-3200",
    address: "Chengalpattu 603001",
    rating: 4.5
  },
  {
    name: "Billroth Hospitals Chengalpattu",
    lat: 12.6890,
    lng: 80.0456,
    city: "Chengalpattu",
    type: "Multi-Specialty Hospital",
    phone: "+91-44-4700-4700",
    address: "Chengalpattu 603001",
    rating: 4.6
  },
  // Vellore & nearby areas
  {
    name: "Christian Medical College Hospital",
    lat: 12.9656,
    lng: 79.1314,
    city: "Vellore",
    type: "Level 1 Trauma Center",
    phone: "+91-416-228-4000",
    address: "Vellore 632004",
    rating: 4.8
  },
  {
    name: "VIT Medical College Hospital",
    lat: 12.9201,
    lng: 79.1458,
    city: "Vellore",
    type: "Emergency Trauma Center",
    phone: "+91-416-224-2555",
    address: "Ranipet, Vellore 632014",
    rating: 4.6
  },
  {
    name: "Apollo Specialty Hospital Vellore",
    lat: 12.9475,
    lng: 79.1205,
    city: "Vellore",
    type: "Multi-Specialty Hospital",
    phone: "+91-416-228-5000",
    address: "Vellore 632006",
    rating: 4.7
  },
  {
    name: "Srimanta Hospital Vellore",
    lat: 12.9523,
    lng: 79.1342,
    city: "Vellore",
    type: "Emergency Trauma Center",
    phone: "+91-416-224-1111",
    address: "Vellore 632004",
    rating: 4.5
  },
  {
    name: "Happy Hospital Ranipet",
    lat: 12.9198,
    lng: 79.1401,
    city: "Ranipet",
    type: "Multi-Specialty Hospital",
    phone: "+91-416-223-2000",
    address: "Ranipet 632014",
    rating: 4.4
  }
];

// Function to calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to get nearby hospitals sorted by distance
function getNearbyHospitals(userLat, userLng, maxDistance = 150) {
  const hospitals = REAL_HOSPITALS
    .map(hospital => {
      const distance = calculateDistance(userLat, userLng, hospital.lat, hospital.lng);
      const travelTime = Math.ceil(distance * 2.5); // ~2.5 min per km
      return {
        ...hospital,
        distance,
        dist: `${distance.toFixed(1)} km`,
        time: `${travelTime} min`
      };
    })
    .filter(hospital => hospital.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // Return top 10 closest
  
  console.log(`[HOSPITAL FINDER] User location: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
  console.log(`[HOSPITAL FINDER] Search radius: ${maxDistance}km`);
  console.log(`[HOSPITAL FINDER] Found ${hospitals.length} nearby hospitals:`, hospitals);
  
  return hospitals;
}

// Shorthand for backward compatibility
const MOCK_HOSPITALS = [];

// Chatbot responses - India Specific
const CHATBOT_RESPONSES = {
  greetings: [
    "नमस्ते! मैं Trauma AID हूं। मैं आपकी कैसे मदद कर सकता हूं? | Hello! I'm Trauma AID. How can I help?",
    "स्वागत है! मैं आपातकालीन जानकारी में सहायता के लिए यहां हूं। | Welcome! I'm here to assist with emergency information.",
    "Trauma AID आपातकाल सहायता में आपका स्वागत है। | Welcome to Trauma AID Emergency Support.",
  ],
  trauma: [
    "मैं आघात की जानकारी में मदद कर सकता हूं। सामान्य प्रकार: घाव, फ्रैक्चर, सिर की चोटें। | I can help with trauma information including wounds, fractures, and head injuries.",
    "आघात प्रतिक्रिया गंभीरता पर निर्भर करती है। क्या आपको घाव देखभाल, CPR के बारे में जानकारी चाहिए? | Trauma response depends on severity. Need info on wound care or CPR?",
  ],
  location: [
    "आपके वर्तमान स्थान का उपयोग करके मैं निकटतम अस्पताल खोज रहा हूं। | Using your location to find nearest hospitals.",
    "आपातकाल सेवाओं के लिए स्थान तक पहुंच सक्षम करें। भारत में 112 पर कॉल करें। | Enable location access. Call 112 in India for emergency.",
  ],
  hospital: [
    "आपके पास कई अस्पताल हैं। Apollo Hospitals Delhi सबसे नजदीक है 0.8 किमी दूर। | Several hospitals available. Apollo Hospitals Delhi is closest at 0.8 km.",
    "आपातकालीन सेवा के लिए निकटतम अस्पताल दिखा रहा हूं। | Showing nearest hospitals for emergency service.",
  ],
  emergency: [
    "भारत में आपातकाल के लिए 112 पर कॉल करें। पुलिस के लिए 100, एम्बुलेंस के लिए 102 भी दिए गए हैं। | Call 112 for emergency in India. Police: 100, Ambulance: 102",
    "तत्काल चिकित्सा सहायता के लिए 112 डायल करें और हमारी तैयारी में सहायता करें। | Dial 112 for immediate medical help.",
  ],
  unknown: [
    "मुझे यह निश्चित नहीं है। क्या आपको आघात सहायता, अस्पताल जानकारी, या प्राथमिक चिकित्सा मार्गदर्शन चाहिए? | Not sure about that. Do you need trauma help, hospital info, or first aid?",
    "मैं आपातकालीन सहायता में विशेषज्ञ हूं। कृपया स्पष्ट करें कि आपको किस प्रकार की सहायता चाहिए। | I specialize in emergency assistance. Please clarify what help you need.",
    "यह मेरी विशेषज्ञता के बाहर है, लेकिन मैं आपातकाल सेवा में मदद कर सकता हूं। | Outside my expertise, but I can help with emergency services.",
  ],
};

// ─── Backend URL ─────────────────────────────────────────────────────────────
// Using "/api" routes through Vite's proxy → avoids all CORS issues.
// Vite rewrites /api/detect → http://localhost:8000/detect automatically.
const BACKEND_URL = "/api";

// ─── Data adapter: maps backend /detect response → frontend result shape ─────
function adaptBackendResult(data) {
  // Backend severity: "critical" / "moderate" / "low"
  // Frontend severity: "CRITICAL" / "MODERATE" / "LOW"
  const severityMap = { critical: "CRITICAL", moderate: "MODERATE", low: "LOW" };
  const severity = severityMap[data.severity] || "LOW";

  // Build injury label from top detected injury
  const topInjury = data.injuries_detected?.[0];

  // Clean up CLIP label: "person with heavy bleeding from arm" → "Heavy Bleeding From Arm"
  const rawLabel = topInjury?.label || "General Injury";
  const injuryLabel = rawLabel
    .replace(/^person with /i, "")
    .replace(/^person /i, "")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // CLIP confidence scaled to a human-readable 0-100
  // Raw softmax over 30+ labels is naturally low (~5-25%), so we scale it
  const rawConf = topInjury?.confidence ?? 0;
  const confidence = Math.min(99, Math.round(rawConf * 350)); // scale 0.28 → ~98%

  // Parse rag_answer into instruction steps
  // rag_answer format from backend:
  // "Condition: ...\nRisk: ...\nSteps:\n1.\n2.\n3.\nRed Flags:\n-\n-"
  let instructions = [];
  if (data.rag_answer) {
    const stepsMatch = data.rag_answer.match(/Steps:\s*([\s\S]*?)(?:Red Flags:|$)/i);
    if (stepsMatch) {
      instructions = stepsMatch[1]
        .split(/\n/)
        .map(l => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
    }
  }
  // Fallback instructions if RAG parsing fails
  if (instructions.length === 0) {
    instructions = [
      "Check if the person is breathing and conscious",
      "Control any visible bleeding with firm pressure",
      "Keep the person still and calm",
      "Call 112 (Emergency) or 102 (Ambulance) immediately",
      "Do not give food or water until assessed by a doctor",
    ];
  }

  // Add low-confidence note at top of instructions if flagged
  if (data.low_confidence) {
    instructions = [
      "⚠️ Low confidence scan — try better lighting or move closer to the injury",
      ...instructions,
    ];
  }

  // Derive region from injury label
  const regionMap = [
    [/head|skull|brain|cranial/i, "Cranial"],
    [/arm|wrist|hand|finger|elbow/i, "Upper Limb"],
    [/leg|foot|ankle|knee/i, "Lower Limb"],
    [/chest|heart/i, "Thoracic"],
    [/burn/i, "Surface"],
    [/back|spine/i, "Spinal"],
  ];
  let region = "General";
  for (const [pattern, label] of regionMap) {
    if (pattern.test(injuryLabel) || (topInjury && pattern.test(topInjury.label))) {
      region = label;
      break;
    }
  }

  return {
    // Fields expected by ResultPanel / VoiceGuide / CameraPage preview
    injury: injuryLabel,
    severity,
    confidence,
    region,
    instructions,
    // Extra fields from backend (available for future use)
    posture: data.posture,
    triage: data.triage,
    rag_answer: data.rag_answer,
    rag_sources: data.rag_sources,
    questions: data.questions,
    injuries_detected: data.injuries_detected,
  };
}

async function callDetectAPI(imageBlob) {
  const formData = new FormData();
  formData.append("file", imageBlob, "capture.jpg");

  const res = await fetch(`${BACKEND_URL}/detect`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Backend error: ${res.status}`);
  }

  const data = await res.json();

  // Backend returns { error: "..." } — treat as low-confidence, not a crash
  if (data.error) {
    return {
      injury: "Unclear Image",
      severity: "LOW",
      confidence: 0,
      region: "Unknown",
      low_confidence: true,
      instructions: [
        "⚠️ " + data.error,
        "Move closer to the injury and ensure good lighting",
        "Try again — hold the camera steady while capturing",
        "Call 112 immediately if this is a life-threatening emergency",
        "Do not wait for AI confirmation in critical situations",
      ],
    };
  }

  return adaptBackendResult(data);
}

// Simple chatbot logic - Backend-powered placeholder
  async function getChatbotResponse(userMessage) {
  return "Medical assistant temporarily unavailable.";
}


// ─── Indian Cities Database (Move outside component) ────────────────────────
const INDIAN_CITIES = {
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Vellore": { lat: 12.9352, lng: 79.1325 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Surat": { lat: 21.1458, lng: 72.8326 },
};

function findNearestCity(lat, lng) {
  let nearestCity = "Delhi";
  let minDistance = Infinity;
  
  Object.entries(INDIAN_CITIES).forEach(([city, coords]) => {
    const distance = Math.sqrt(
      Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });
  
  console.log(`[LOCATION] Detected nearest city: ${nearestCity} (${minDistance.toFixed(3)}° away)`);
  return nearestCity;
}

// ─── Utility Hooks ────────────────────────────────────────────────────────────
function useVoiceSpeech() {
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.4; // Higher pitch for feminine voice
    u.volume = 1;
    
    // Get all available voices and find female voice
    let voices = window.speechSynthesis.getVoices();
    
    // If voices not loaded, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
      };
    }
    
    // Priority female voice search
    let femaleVoice = null;
    
    // First try specific female voices (most reliable)
    const femaleNames = [
      "Samantha",
      "Victoria", 
      "Moira",
      "Fiona",
      "Zira",
      "Google UK English Female",
      "Google US English Female",
      "Microsoft Zira",
      "Alex",
    ];
    
    for (const name of femaleNames) {
      femaleVoice = voices.find(v => v.name.includes(name));
      if (femaleVoice) break;
    }
    
    // If no specific female found, find any voice marked as female
    if (!femaleVoice) {
      femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes("female") || 
        v.name.toLowerCase().includes("woman") ||
        v.name.toLowerCase().includes("girl")
      );
    }
    
    // Use found female voice or default
    if (femaleVoice) {
      u.voice = femaleVoice;
      console.log(`🎤 Using voice: ${femaleVoice.name}`);
    } else {
      console.log("⚠️ Using system default voice");
    }
    
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  const replay = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utteranceRef.current);
    }
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  }, []);

  return { speak, replay, stop };
}

// ─── Inline Styles - Apple Glassmorphism ──────────────────────────────────────
const glassCard = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "1.25rem",
};

const glassCardStrong = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "1.5rem",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Scan: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round"/>
      <path d="M8 12h8M12 8v8" strokeLinecap="round"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round"/>
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Volume: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeLinecap="round"/>
      <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="9 18 15 12 9 6" strokeLinecap="round"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round"/>
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"spin 1s linear infinite"}}>
      <line x1="12" y1="2" x2="12" y2="6" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" strokeLinecap="round"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="6" y2="12" strokeLinecap="round"/>
      <line x1="18" y1="12" x2="22" y2="12" strokeLinecap="round"/>
    </svg>
  ),
  Camera: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round"/>
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round"/>
      <polyline points="12 19 5 12 12 5" strokeLinecap="round"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round"/>
    </svg>
  ),
  Crosshair: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="22" y1="12" x2="18" y2="12" strokeLinecap="round"/>
      <line x1="6" y1="12" x2="2" y2="12" strokeLinecap="round"/>
      <line x1="12" y1="6" x2="12" y2="2" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="12" y2="18" strokeLinecap="round"/>
    </svg>
  ),
  Hospital: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round"/>
      <path d="M9 12h6M12 9v6" strokeLinecap="round"/>
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22l-8-5L2 9l13-7z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14" strokeLinecap="round"/>
    </svg>
  ),
  Navigation: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" strokeLinecap="round"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Loader Component ─────────────────────────────────────────────────────────
function Loader({ text = "Analyzing..." }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
      <div style={{position:"relative",width:56,height:56}}>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          border:"2px solid rgba(99,102,241,0.2)",
        }}/>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          border:"2px solid transparent",
          borderTopColor:"#0066ff",
          animation:"spin 1s linear infinite",
        }}/>
        <div style={{
          position:"absolute",inset:8,borderRadius:"50%",
          border:"2px solid transparent",
          borderTopColor:"rgba(0,102,255,0.5)",
          animation:"spin 1.5s linear infinite reverse",
        }}/>
      </div>
      <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.875rem",letterSpacing:"0.1em"}}>{text}</p>
    </div>
  );
}

// ─── Detection Overlay Component ──────────────────────────────────────────────
function DetectionOverlay({ result, scanning }) {
  const [boxes] = useState([
    { x: 28, y: 22, w: 38, h: 42, label: "Person detected" },
    { x: 35, y: 38, w: 18, h: 22, label: result?.injury || "Analyzing..." },
  ]);

  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
      {/* Corner brackets */}
      {[
        {top:16,left:16,rotate:0},
        {top:16,right:16,rotate:90},
        {bottom:16,right:16,rotate:180},
        {bottom:16,left:16,rotate:270},
      ].map((pos,i) => (
        <div key={i} style={{
          position:"absolute",...pos,
          width:32,height:32,
          opacity: scanning ? 1 : 0.4,
          transition:"opacity 0.5s",
        }}>
          <svg viewBox="0 0 32 32" fill="none" stroke="#818cf8" strokeWidth="2">
            <path d="M4 28V4h24" strokeLinecap="round" transform={`rotate(${pos.rotate} 16 16)`}/>
          </svg>
        </div>
      ))}

      {/* Scan line */}
      {scanning && (
        <div style={{
          position:"absolute",left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,#818cf8,#c084fc,transparent)",
          animation:"scanLine 2.5s ease-in-out infinite",
          boxShadow:"0 0 12px rgba(0,102,255,0.8)",
        }}/>
      )}

      {/* Grid overlay */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"linear-gradient(rgba(0,102,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,102,255,0.04) 1px,transparent 1px)",
        backgroundSize:"60px 60px",
      }}/>

      {/* Detection boxes */}
      {result && boxes.map((box, i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${box.x}%`,top:`${box.y}%`,
          width:`${box.w}%`,height:`${box.h}%`,
          border:`1.5px solid ${i===1 ? (COLORS[result.severity?.toLowerCase()]?.accent || "#0066ff") : "rgba(0,102,255,0.5)"}`,
          borderRadius:4,
          animation:"fadeInBox 0.4s ease",
        }}>
          <div style={{
            position:"absolute",top:-28,left:0,
            background: i===1 ? (COLORS[result.severity?.toLowerCase()]?.accent || "#0066ff") : "rgba(0,102,255,0.8)",
            color:"#fff",fontSize:"0.7rem",fontWeight:600,
            padding:"3px 8px",borderRadius:4,
            whiteSpace:"nowrap",letterSpacing:"0.05em",
          }}>
            {i===0 ? "SUBJECT" : box.label.toUpperCase()}
          </div>
          {/* Corner dots */}
          {[[0,0],[0,100],[100,0],[100,100]].map(([tx,ty],j) => (
            <div key={j} style={{
              position:"absolute",
              left:`${tx}%`,top:`${ty}%`,
              width:6,height:6,borderRadius:"50%",
              background: i===1 ? (COLORS[result.severity?.toLowerCase()]?.accent || "#0066ff") : "#0066ff",
              transform:"translate(-50%,-50%)",
            }}/>
          ))}
        </div>
      ))}

      {/* Confidence readout */}
      {result && (
        <div style={{
          position:"absolute",bottom:20,right:16,
          fontSize:"0.65rem",color:"rgba(255,255,255,0.6)",
          letterSpacing:"0.12em",textAlign:"right",
        }}>
          <div style={{color:"#818cf8",fontWeight:700,fontSize:"0.75rem"}}>{result.confidence}%</div>
          <div>CONFIDENCE</div>
        </div>
      )}

      {/* Live indicator */}
      <div style={{
        position:"absolute",top:16,right:56,
        display:"flex",alignItems:"center",gap:6,
        background:"rgba(0,0,0,0.5)",
        padding:"4px 10px",borderRadius:20,
        fontSize:"0.65rem",letterSpacing:"0.12em",color:"rgba(255,255,255,0.8)",fontWeight:600,
      }}>
        <div style={{
          width:6,height:6,borderRadius:"50%",background:"#ef4444",
          animation:"pulse 1.5s ease-in-out infinite",
        }}/>
        LIVE
      </div>
    </div>
  );
}

// ─── Camera Feed Component ────────────────────────────────────────────────────
function CameraFeed({ onResult, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [localResult, setLocalResult] = useState(null);
  const [frameCount, setFrameCount] = useState(0);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setScanning(true);
      }
    } catch (err) {
      onError?.("Camera access denied. Please enable camera permissions.");
    }
  }, [onError]);

  // Capture frame and send to API
  const captureAndDetect = useCallback(async () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
  if (!blob) return;

  const imageUrl = URL.createObjectURL(blob);
  setCapturedImage(imageUrl);

    // ✅ STOP camera after capture
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCameraActive(false);
    setScanning(false);

    // ✅ Save image (for backend later)
    console.log("Captured image:", blob);

    setDetecting(true);

    try {
      const result = await callDetectAPI(blob);
      setLocalResult(result);
      onResult?.(result);
    } catch (err) {
      console.error("Detection error:", err);
      const errorResult = {
        injury: "Detection Failed",
        severity: "LOW",
        confidence: 0,
        region: "Unknown",
        instructions: [
          err.message || "Could not reach the backend server.",
          "Make sure the FastAPI backend is running: cd VLM && uvicorn main:app --reload",
          "Check that http://localhost:8000 is accessible.",
          "Try capturing a clearer, well-lit image of the injury.",
          "Call 112 if this is a real emergency — do not wait for AI.",
        ],
      };
      setLocalResult(errorResult);
      onResult?.(errorResult);
    }

    setDetecting(false);

  }, "image/jpeg", 0.9);

}, [onResult]);

  // Auto-detect every 3 seconds
  

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, [startCamera]);

  return (
    <div style={{position:"relative",width:"100%",height:"100%",background:"#000",overflow:"hidden"}}>
      <video
        ref={videoRef}
        style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
        muted
        playsInline
      />
      {capturedImage && (
  <img
    src={capturedImage}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: 5
    }}
  />
)}
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <button
  onClick={captureAndDetect}
  style={{
    position: "absolute",
    bottom: 90,
    left: "50%",
    transform: "translateX(-50%)",
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: "#fff",
    border: "4px solid #ccc",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    cursor: "pointer",
    zIndex: 20
  }}
/>
      <DetectionOverlay result={localResult} scanning={scanning}/>

      {/* Processing indicator */}
      {detecting && (
        <div style={{
          position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",
          ...glassCard,padding:"8px 16px",
          display:"flex",alignItems:"center",gap:8,
          fontSize:"0.75rem",color:"rgba(255,255,255,0.9)",letterSpacing:"0.08em",
        }}>
          <div style={{
            width:8,height:8,borderRadius:"50%",background:"#0066ff",
            animation:"pulse 0.8s ease-in-out infinite",
          }}/>
          ANALYZING FRAME {frameCount}
        </div>
      )}

      {/* No camera fallback */}
      {!cameraActive && (
        <div style={{
          position:"absolute",inset:0,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:"1rem",
          background:"linear-gradient(135deg,#0f0f1a,#1a0f2e)",
        }}>
          <div style={{opacity:0.3,fontSize:3}}>📷</div>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.875rem"}}>Initializing camera...</p>
          <Loader text="Requesting camera access"/>
        </div>
      )}
    </div>
  );
}

// ─── Q&A Panel Component ──────────────────────────────────────────────────────
function QnAPanel({ result, onSeverityUpdate, onComplete }) {
  const questions = [
    { id: "conscious", text: "Is the person conscious?", yesEffect: null, noEffect: "CRITICAL" },
    { id: "breathing", text: "Is the person breathing?", yesEffect: null, noEffect: "CRITICAL" },
    { id: "bleeding", text: "Is there visible bleeding?", yesEffect: "CRITICAL", noEffect: null },
    { id: "responsive", text: "Are they responsive to voice?", yesEffect: null, noEffect: "MODERATE" },
  ];

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (qId, answer) => {
    const q = questions.find(q => q.id === qId);

    if (answer === "no" && q.noEffect === "CRITICAL") onSeverityUpdate?.("CRITICAL");
    else if (answer === "yes" && q.yesEffect === "CRITICAL") onSeverityUpdate?.("CRITICAL");

    const newAnswers = { ...answers, [qId]: answer };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(n => n + 1), 400);
    } else {
      // Last question answered — mark done and call onComplete
      setTimeout(() => {
        setDone(true);
        onComplete?.();
      }, 500);
    }
  };

  const activeQ = questions[currentQ];
  const isAnswered = answers[activeQ?.id] !== undefined;

  return (
    <div style={{...glassCard, padding:"1.25rem"}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:"1rem"}}>
        <div style={{
          width:28, height:28, borderRadius:8,
          background:"rgba(129,140,248,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#818cf8",
        }}>
          <Icons.Activity/>
        </div>
        <span style={{fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,0.9)", letterSpacing:"0.08em"}}>
          PATIENT ASSESSMENT
        </span>
        <span style={{marginLeft:"auto", fontSize:"0.7rem", color:"rgba(255,255,255,0.4)"}}>
          {Object.keys(answers).length}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{height:2, background:"rgba(255,255,255,0.06)", borderRadius:1, marginBottom:"1rem"}}>
        <div style={{
          height:"100%", borderRadius:1,
          background:"linear-gradient(90deg,#0066ff,#3399ff)",
          width:`${(Object.keys(answers).length / questions.length) * 100}%`,
          transition:"width 0.4s ease",
        }}/>
      </div>

      {/* Previous answers */}
      {questions.slice(0, currentQ).map((q) => (
        <div key={q.id} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", marginBottom:4,
        }}>
          <span style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.35)"}}>{q.text}</span>
          <span style={{
            fontSize:"0.7rem", fontWeight:600, letterSpacing:"0.08em",
            color: answers[q.id] === "yes" ? "#10b981" : "#f87171",
          }}>
            {answers[q.id]?.toUpperCase()}
          </span>
        </div>
      ))}

      {/* Active question */}
      {!done && activeQ && !isAnswered && (
        <div style={{marginTop:8}}>
          <p style={{fontSize:"0.875rem", color:"rgba(255,255,255,0.9)", marginBottom:"0.875rem", lineHeight:1.5}}>
            {activeQ.text}
          </p>
          <div style={{display:"flex", gap:8}}>
            {["yes","no"].map(ans => (
              <button
                key={ans}
                onClick={() => handleAnswer(activeQ.id, ans)}
                style={{
                  flex:1, padding:"10px",
                  background: ans === "yes" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${ans === "yes" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius:10,
                  color: ans === "yes" ? "#6ee7b7" : "#fca5a5",
                  fontWeight:700, fontSize:"0.875rem",
                  cursor:"pointer", letterSpacing:"0.08em", transition:"all 0.15s",
                }}
                onMouseEnter={e => e.target.style.transform="scale(1.02)"}
                onMouseLeave={e => e.target.style.transform="scale(1)"}
              >
                {ans.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completion message */}
      {done && (
        <div style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px",
          background:"rgba(16,185,129,0.08)",
          border:"1px solid rgba(16,185,129,0.2)",
          borderRadius:10, marginTop:8,
        }}>
          <Icons.Check/>
          <span style={{fontSize:"0.8rem", color:"#6ee7b7", fontWeight:500}}>Assessment complete — loading results...</span>
        </div>
      )}
    </div>
  );
}

// ─── Voice Guide Component ────────────────────────────────────────────────────
function VoiceGuide({ result, onReplay, onStop }) {
  const [speaking, setSpeaking] = useState(false);
  const timeoutRef = useRef(null);

  if (!result) return null;

  const handleStop = () => {
    onStop?.();
    setSpeaking(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleReplay = () => {
    onStop?.(); // Stop any current playback first
    setSpeaking(true);
    onReplay?.();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSpeaking(false);
    }, 4000);
  };

  return (
    <div style={{...glassCard,padding:"1rem",display:"flex",alignItems:"center",gap:12}}>
      <div style={{
        width:36,height:36,borderRadius:"50%",flexShrink:0,
        background:"rgba(129,140,248,0.15)",
        display:"flex",alignItems:"center",justifyContent:"center",
        color:"#818cf8",
        animation: speaking ? "pulse 1s ease-in-out infinite" : "none",
      }}>
        <Icons.Volume/>
      </div>
      <div style={{flex:1}}>
        <p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.9)",fontWeight:600,letterSpacing:"0.06em"}}>
          VOICE GUIDANCE
        </p>
        <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginTop:2}}>
          Step-by-step audio instructions active
        </p>
      </div>
      <div style={{display:"flex",gap:8}}>
        {speaking && (
          <button
            onClick={handleStop}
            style={{
              padding:"6px 14px",
              background:"rgba(255,59,48,0.15)",
              border:"1px solid rgba(255,59,48,0.3)",
              borderRadius:8,color:"#ff8787",
              fontSize:"0.7rem",fontWeight:600,cursor:"pointer",
              letterSpacing:"0.06em",transition:"all 0.15s",whiteSpace:"nowrap",
            }}
            onMouseEnter={e => e.target.style.background="rgba(255,59,48,0.25)"}
            onMouseLeave={e => e.target.style.background="rgba(255,59,48,0.15)"}
          >
            ⏹ STOP
          </button>
        )}
        <button
          onClick={handleReplay}
          style={{
            padding:"6px 14px",
            background:"rgba(129,140,248,0.12)",
            border:"1px solid rgba(129,140,248,0.3)",
            borderRadius:8,color:"#a5b4fc",
            fontSize:"0.7rem",fontWeight:600,cursor:"pointer",
            letterSpacing:"0.06em",transition:"all 0.15s",whiteSpace:"nowrap",
          }}
          onMouseEnter={e => e.target.style.background="rgba(129,140,248,0.2)"}
          onMouseLeave={e => e.target.style.background="rgba(129,140,248,0.12)"}
        >
          ↺ REPLAY
        </button>
      </div>
    </div>
  );
}

// ─── Result Panel Component ───────────────────────────────────────────────────
function ResultPage({ result, onSeverityUpdate, assessmentComplete, setAssessmentComplete }) {
  const { speak, replay, stop } = useVoiceSpeech();

  useEffect(() => {
    if (result && assessmentComplete) {
      const text = `${result.severity} alert. ${result.injury} detected. ${result.instructions[0]}. ${result.instructions[1]}.`;
      speak(text);
    }
  }, [result, assessmentComplete, speak]);

  return (
    <div style={{
      flex:1, overflowY:"auto",
      background:"linear-gradient(160deg,#0a0e27 0%,#1a1f3a 100%)",
      padding:"1rem 1rem 80px 1rem", display:"flex", flexDirection:"column", gap:"1rem",
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0.5rem 0" }}>
        <div style={{
          width:32, height:32, borderRadius:10,
          background:"rgba(129,140,248,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#818cf8",
        }}>
          <Icons.Activity/>
        </div>
        <div>
          <h2 style={{margin:0, fontSize:"1.1rem", fontWeight:700, color:"rgba(255,255,255,0.95)"}}>
            Analysis Results
          </h2>
          <p style={{margin:0, fontSize:"0.7rem", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em"}}>
            {result ? (assessmentComplete ? "ASSESSMENT COMPLETE" : "PATIENT ASSESSMENT") : "AWAITING SCAN"}
          </p>
        </div>
      </div>

      {result && !assessmentComplete && (
        <QnAPanel
          result={result}
          onSeverityUpdate={onSeverityUpdate}
          onComplete={() => setAssessmentComplete(true)}
        />
      )}

      {result && assessmentComplete && (
        <>
          <VoiceGuide result={result} onReplay={replay} onStop={stop}/>
          <ResultPanel result={result} onSeverityUpdate={onSeverityUpdate}/>
        </>
      )}

      {!result && (
        <div style={{...glassCard, padding:"2rem", textAlign:"center"}}>
          <div style={{color:"rgba(255,255,255,0.15)", marginBottom:"1rem", fontSize:"2rem"}}>◎</div>
          <p style={{color:"rgba(255,255,255,0.3)", fontSize:"0.875rem", letterSpacing:"0.05em"}}>
            No scan yet — go to the Scan tab to capture an image.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{...glassCard, padding:"12px", display:"flex", gap:10, alignItems:"flex-start"}}>
        <div style={{color:"rgba(255,255,255,0.3)", flexShrink:0, marginTop:1}}>
          <Icons.Info/>
        </div>
        <p style={{fontSize:"0.7rem", color:"rgba(255,255,255,0.3)", lineHeight:1.5, margin:0}}>
          AI detection is for guidance only and does not replace professional medical assessment.
          Call 112 (Emergency), 100 (Police), or 102 (Ambulance) in India for critical situations.
        </p>
      </div>
    </div>
  );
}

// ─── Google Maps Integration Utilities ────────────────────────────────────────
const getDistanceAndDuration = async (origin, destination) => {
  if (!window.google) return { distance: "N/A", duration: "N/A" };
  
  const service = new window.google.maps.DistanceMatrixService();
  try {
    const response = await service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    
    if (response.rows[0].elements[0].status === "OK") {
      const distance = response.rows[0].elements[0].distance.text;
      const duration = response.rows[0].elements[0].duration.text;
      return { distance, duration };
    }
  } catch (error) {
    console.error("Distance calculation error:", error);
  }
  return { distance: "N/A", duration: "N/A" };
};

const geocodeAddress = async (address) => {
  if (!window.google) return null;
  
  const geocoder = new window.google.maps.Geocoder();
  try {
    const results = await geocoder.geocode({ address });
    if (results.length > 0) {
      const location = results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: results[0].formatted_address
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

// ─── Google Map Page - Real-time Hospital Finder with Live Geolocation ──────
/**
 * FIXED MapPage — Trauma AID
 * Drop-in replacement. Uses Leaflet + Overpass API (no Google Maps needed).
 * Falls back to curated TN hospital list if Overpass is unavailable.
 */

const FALLBACK_HOSPITALS = [
  { id:"f1", name:"Christian Medical College Hospital", lat:12.9241, lng:79.1326, type:"Level 1 Trauma Center",   phone:"+91-416-228-4000", address:"Vellore 632004" },
  { id:"f2", name:"Apollo Specialty Hospital Vellore",  lat:12.9475, lng:79.1205, type:"Multi-Specialty Hospital", phone:"+91-416-228-5000", address:"Vellore 632006" },
  { id:"f3", name:"Government Vellore Medical College", lat:12.9194, lng:79.1325, type:"Government Hospital",      phone:"+91-416-222-2100", address:"Vellore 632011" },
  { id:"f4", name:"Srimanta Hospital Vellore",          lat:12.9523, lng:79.1342, type:"Emergency Trauma Center",  phone:"+91-416-224-1111", address:"Vellore 632004" },
  { id:"f5", name:"VIT Medical College Hospital",       lat:12.9701, lng:79.1559, type:"Emergency Trauma Center",  phone:"+91-416-224-2555", address:"Vellore 632014" },
  { id:"f6", name:"Fortis Malar Hospital Chennai",      lat:13.0499, lng:80.2247, type:"Emergency Trauma Center",  phone:"+91-44-4228-6666", address:"Adyar, Chennai 600020" },
  { id:"f7", name:"Apollo Hospitals Chennai",           lat:13.0668, lng:80.2776, type:"Level 1 Trauma Center",    phone:"+91-44-2829-0200", address:"Greames Road, Chennai 600006" },
  { id:"f8", name:"Kauvery Hospital Chennai",           lat:13.0827, lng:80.2707, type:"Multi-Specialty Hospital",  phone:"+91-44-4000-6000", address:"Chennai 600010" },
  { id:"f9", name:"Saveetha Medical College",           lat:12.7674, lng:80.1614, type:"Level 1 Trauma Center",    phone:"+91-44-4734-4734", address:"Chengalpattu 603102" },
  { id:"f10",name:"Aravind Eye Hospital Vellore",       lat:12.9360, lng:79.1290, type:"Specialty Hospital",       phone:"+91-416-222-1971", address:"Vellore 632001" },
];

function hav(lat1,lng1,lat2,lng2){
  const R=6371,dLat=((lat2-lat1)*Math.PI)/180,dLng=((lng2-lng1)*Math.PI)/180;
  const a=Math.sin(dLat/2)**2+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function fmtD(km){return km<1?`${(km*1000).toFixed(0)} m`:`${km.toFixed(1)} km`;}
function withDist(list,lat,lng){
  return list.map(h=>{const d=hav(lat,lng,h.lat,h.lng);return{...h,distNum:d,dist:fmtD(d),time:`${Math.ceil(d*2.5)} min`};}).sort((a,b)=>a.distNum-b.distNum).slice(0,10);
}
async function overpass(lat,lng,r){
  const q=`[out:json][timeout:20];(node["amenity"="hospital"](around:${r},${lat},${lng});way["amenity"="hospital"](around:${r},${lat},${lng});node["amenity"="clinic"](around:${r},${lat},${lng});node["healthcare"="hospital"](around:${r},${lat},${lng}););out body;>;out skel qt;`;
  const res=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(q)}`});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const d=await res.json();
  return d.elements.filter(e=>e.lat&&e.lon&&e.tags?.name).map(e=>({id:String(e.id),name:e.tags.name,lat:e.lat,lng:e.lon,address:e.tags["addr:full"]||e.tags["addr:street"]||e.tags["addr:city"]||"See on map",type:e.tags.amenity==="hospital"?"Hospital":"Clinic",phone:e.tags.phone||e.tags["contact:phone"]||"Not listed"}));
}

function MapPage({location,locationCity}){
  const mapRef=useRef(null),mapInst=useRef(null),uMarker=useRef(null),mRefs=useRef([]);
  const [hospitals,setHospitals]=useState([]);
  const [sel,setSel]=useState(null);
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState("");
  const [mapReady,setMapReady]=useState(false);
  const [lfLoaded,setLfLoaded]=useState(!!window.L);
  const [err,setErr]=useState(null);
  const fetched=useRef(false);

  // Load Leaflet
  useEffect(()=>{
    if(window.L){setLfLoaded(true);return;}
    const lk=document.createElement("link");lk.rel="stylesheet";lk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(lk);
    const sc=document.createElement("script");sc.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";sc.onload=()=>setLfLoaded(true);sc.onerror=()=>setLfLoaded(true);document.head.appendChild(sc);
  },[]);

  // Init map
  useEffect(()=>{
    if(!lfLoaded||!location?.lat||!mapRef.current||mapInst.current)return;
    const L=window.L,{lat,lng}=location;
    const map=L.map(mapRef.current,{center:[lat,lng],zoom:14,zoomControl:true,attributionControl:false});
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19,subdomains:"abcd"}).addTo(map);
    const ui=L.divIcon({className:"",html:`<div style="width:18px;height:18px;border-radius:50%;background:#1f91ff;border:3px solid #fff;box-shadow:0 0 0 8px rgba(31,145,255,0.2);"></div>`,iconSize:[18,18],iconAnchor:[9,9]});
    uMarker.current=L.marker([lat,lng],{icon:ui,zIndexOffset:1000}).addTo(map).bindPopup("<b>You are here</b>");
    mapInst.current=map;
    setMapReady(true);
  },[lfLoaded,location]);

  // Update user dot
  useEffect(()=>{
    if(!mapInst.current||!uMarker.current||!location?.lat)return;
    uMarker.current.setLatLng([location.lat,location.lng]);
  },[location?.lat,location?.lng]);

  // Fetch hospitals
  useEffect(()=>{
    if(!mapReady||!location?.lat||fetched.current)return;
    fetched.current=true;
    (async()=>{
      setLoading(true);setErr(null);
      const{lat,lng}=location;let list=[];
      for(const r of[5000,15000,30000]){
        try{setStatus(`Searching ${r/1000}km radius…`);const res=await overpass(lat,lng,r);if(res.length>0){list=withDist(res,lat,lng);break;}}
        catch(e){console.warn("Overpass",r,e.message);}
      }
      if(list.length===0){setErr("Live search unavailable — showing known hospitals");list=withDist(FALLBACK_HOSPITALS,lat,lng);}
      setHospitals(list);
      const L=window.L;
      mRefs.current.forEach(m=>mapInst.current.removeLayer(m));mRefs.current=[];
      list.forEach((h,i)=>{
        const ic=L.divIcon({className:"",html:`<div style="width:30px;height:30px;border-radius:50%;background:#ef4444;border:2.5px solid #fff;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.5);">${i+1}</div>`,iconSize:[30,30],iconAnchor:[15,15]});
        const mk=L.marker([h.lat,h.lng],{icon:ic}).addTo(mapInst.current).on("click",()=>{setSel(h);mapInst.current.setView([h.lat,h.lng],16);});
        mRefs.current.push(mk);
      });
      if(list.length>0){
        const pts=[[lat,lng],...list.slice(0,5).map(h=>[h.lat,h.lng])];
        mapInst.current.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
      }
      setLoading(false);setStatus("");
    })();
  },[mapReady,location]);

  const glass={background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)"};

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",width:"100%",height:"100%",position:"relative",overflow:"hidden",background:"#0a0e27",paddingBottom:"75px"}}>
      <style>{`.leaflet-container{background:#0a0e27!important}.leaflet-popup-content-wrapper{border-radius:10px!important}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header */}
      <div style={{background:"rgba(0,102,255,0.15)",borderBottom:"1px solid rgba(0,102,255,0.3)",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <span style={{fontSize:"1.1rem"}}>📍</span>
        <div style={{flex:1}}>
          <p style={{margin:"0 0 1px",fontSize:"0.62rem",color:"rgba(255,255,255,0.45)",textTransform:"uppercase",fontWeight:600,letterSpacing:"0.1em"}}>Your Location</p>
          <p style={{margin:0,fontSize:"0.95rem",color:"#fff",fontWeight:700}}>{locationCity||(location?`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`:"Acquiring GPS…")}</p>
        </div>
        {location?.accuracy&&<div style={{background:"rgba(31,145,255,0.9)",color:"#fff",padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:700}}>✓ GPS ±{location.accuracy.toFixed(0)}m</div>}
      </div>

      {/* No GPS */}
      {!location?.lat&&<div style={{position:"absolute",inset:0,top:52,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,background:"#0a0e27",zIndex:20}}>
        <div style={{fontSize:"2.5rem"}}>📡</div>
        <p style={{color:"#fff",fontWeight:600,fontSize:"1rem",margin:0}}>Acquiring GPS…</p>
        <p style={{color:"#666",fontSize:"0.82rem",textAlign:"center",maxWidth:260,margin:0}}>Allow location access to find nearby hospitals.</p>
        <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid transparent",borderTopColor:"#1f91ff",animation:"spin 0.9s linear infinite"}}/>
      </div>}

      {/* Map */}
      <div ref={mapRef} style={{flex:1,width:"100%",minHeight:0,position:"relative",zIndex:1}}/>

      {/* Loading pill */}
      {loading&&<div style={{position:"absolute",top:68,left:"50%",transform:"translateX(-50%)",...glass,borderRadius:20,padding:"8px 18px",display:"flex",alignItems:"center",gap:8,zIndex:50,fontSize:"0.73rem",color:"#fff",whiteSpace:"nowrap",animation:"fadeIn 0.3s ease"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#1f91ff",animation:"pulse 0.85s ease-in-out infinite"}}/>
        {status||"Finding hospitals…"}
      </div>}

      {/* Error banner */}
      {err&&!loading&&<div style={{position:"absolute",top:68,left:"50%",transform:"translateX(-50%)",background:"rgba(255,149,0,0.15)",border:"1px solid rgba(255,149,0,0.35)",borderRadius:10,padding:"6px 14px",fontSize:"0.7rem",color:"#ffd580",zIndex:50,whiteSpace:"nowrap",animation:"fadeIn 0.3s ease"}}>⚠ {err}</div>}

      {/* Detail sheet */}
      {sel&&<div style={{position:"fixed",bottom:75,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderRadius:"20px 20px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.4)",zIndex:999,animation:"slideUp 0.3s ease-out",display:"flex",flexDirection:"column",maxHeight:"72vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:"#ddd"}}/></div>
        <div style={{padding:"8px 16px 14px",borderBottom:"1px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"2px 8px",marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444"}}/>
              <span style={{fontSize:"0.65rem",fontWeight:700,color:"#ef4444",letterSpacing:"0.06em"}}>#{hospitals.indexOf(sel)+1} NEAREST</span>
            </div>
            <h2 style={{margin:"0 0 3px",fontSize:"1.05rem",fontWeight:700,color:"#000",wordBreak:"break-word",lineHeight:1.3}}>{sel.name}</h2>
            <p style={{margin:0,fontSize:"0.78rem",color:"#888"}}>{sel.type}</p>
          </div>
          <button onClick={()=>setSel(null)} style={{background:"#f5f5f5",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",color:"#555"}}>✕</button>
        </div>
        <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,borderBottom:"1px solid #f0f0f0"}}>
          {[{icon:"📍",label:"Distance",value:sel.dist},{icon:"⏱",label:"Est. Drive",value:sel.time}].map(({icon,label,value})=>(
            <div key={label} style={{background:"#f8faff",borderRadius:10,padding:"10px 12px"}}>
              <p style={{margin:"0 0 3px",fontSize:"0.62rem",color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{icon} {label}</p>
              <p style={{margin:0,fontSize:"1.05rem",fontWeight:700,color:"#1f91ff"}}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
          {[{icon:"🏠",label:"Address",value:sel.address},{icon:"📞",label:"Phone",value:sel.phone,mono:true}].map(({icon,label,value,mono})=>(
            <div key={label} style={{background:"#f8faff",borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"flex-start",gap:8}}>
              <span style={{flexShrink:0,fontSize:"0.9rem"}}>{icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 2px",fontSize:"0.6rem",color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</p>
                <p style={{margin:0,fontSize:"0.8rem",color:mono?"#1f91ff":"#333",fontFamily:mono?"monospace":"inherit",fontWeight:mono?600:400,wordBreak:"break-word",lineHeight:1.4}}>{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"0 16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <a href={`tel:${sel.phone.replace(/[^\d+]/g,"")}`} style={{padding:"13px 8px",background:"#ef4444",color:"#fff",textDecoration:"none",borderRadius:10,textAlign:"center",fontWeight:700,fontSize:"0.875rem",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>📞 Call Now</a>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer" style={{padding:"13px 8px",background:"#1f91ff",color:"#fff",textDecoration:"none",borderRadius:10,textAlign:"center",fontWeight:700,fontSize:"0.875rem",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>🗺️ Directions</a>
        </div>
      </div>}

      {/* Hospital list */}
      {!sel&&hospitals.length>0&&<div style={{position:"fixed",bottom:75,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderRadius:"18px 18px 0 0",maxHeight:"44vh",overflowY:"auto",boxShadow:"0 -4px 24px rgba(0,0,0,0.25)",zIndex:40,animation:"slideUp 0.35s ease-out"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:"#ddd"}}/></div>
        <div style={{padding:"6px 16px 10px",borderBottom:"1px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f9fafb"}}>
          <div>
            <h3 style={{margin:0,fontSize:"0.9rem",fontWeight:700,color:"#111"}}>🏥 Nearest Hospitals</h3>
            <p style={{margin:"2px 0 0",fontSize:"0.68rem",color:"#999"}}>Tap any hospital for details & directions</p>
          </div>
          <span style={{background:"#ef4444",color:"#fff",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.75rem"}}>{hospitals.length}</span>
        </div>
        <div style={{padding:"8px 16px",background:"#fef2f2",borderBottom:"1px solid #fee2e2",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:"0.75rem",fontWeight:700,color:"#ef4444"}}>🚨 Emergency:</span>
          {[{label:"Ambulance",num:"102"},{label:"Emergency",num:"112"}].map(({label,num})=>(
            <a key={num} href={`tel:${num}`} style={{background:"#ef4444",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:"0.72rem",fontWeight:700,textDecoration:"none"}}>{num} {label}</a>
          ))}
        </div>
        {hospitals.map((h,i)=>(
          <button key={h.id} onClick={()=>{setSel(h);mapInst.current?.setView([h.lat,h.lng],16);}}
            style={{width:"100%",padding:"12px 16px",borderBottom:"1px solid #f5f5f5",cursor:"pointer",background:"transparent",border:"none",textAlign:"left",display:"flex",alignItems:"center",gap:12,transition:"background 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#f9fafb";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
            <div style={{background:i===0?"#ef4444":i<=2?"#f97316":"#6b7280",color:"#fff",width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.78rem",flexShrink:0}}>{i+1}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 2px",fontSize:"0.875rem",fontWeight:600,color:"#000",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</p>
              <p style={{margin:0,fontSize:"0.7rem",color:"#888"}}>{h.type}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <p style={{margin:"0 0 1px",fontSize:"0.82rem",color:"#1f91ff",fontWeight:700}}>{h.dist}</p>
              <p style={{margin:0,fontSize:"0.67rem",color:"#bbb"}}>⏱ {h.time}</p>
            </div>
            <span style={{color:"#ccc",fontSize:"1.2rem",flexShrink:0}}>›</span>
          </button>
        ))}
      </div>}

      {/* No results */}
      {!loading&&hospitals.length===0&&location?.lat&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"#fff",borderRadius:"16px 16px 0 0",padding:"24px",textAlign:"center",zIndex:40}}>
        <div style={{fontSize:"2rem",marginBottom:8}}>🏥</div>
        <p style={{margin:"0 0 4px",fontSize:"0.9rem",fontWeight:600,color:"#000"}}>No hospitals found</p>
        <p style={{margin:0,fontSize:"0.82rem",color:"#666"}}>Check your connection and try again.</p>
      </div>}
    </div>
  );
}


// ─── Chat Page ────────────────────────────────────────────────────────────────
function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Trauma AID Assistant. How can I help you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);



  const handleSendMessage = useCallback(async () => {
  if (!inputValue.trim()) return;

  const userMessage = {
    id: messages.length + 1,
    text: inputValue,
    sender: "user",
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue("");
  setIsLoading(true);

  try {
    const reply = await getChatbotResponse(inputValue);

    const botResponse = {
      id: messages.length + 2,
      text: reply,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botResponse]);
  } catch (error) {
    console.error(error);

    setMessages(prev => [
      ...prev,
      {
        id: messages.length + 2,
        text: "Error getting response",
        sender: "bot",
        timestamp: new Date(),
      }
    ]);
  }

  setIsLoading(false);
}, [inputValue, messages.length]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: `linear-gradient(135deg, ${APPLE_COLORS.primary} 0%, ${APPLE_COLORS.secondary} 100%)`,
      minHeight: 0,
      position: "relative",
      width: "100%",
      boxSizing: "border-box",
      paddingBottom: "75px",
    }}>
      {/* Chat Header */}
      <div style={{
        ...glassCardStrong,
        borderRadius: "0 0 1.5rem 1.5rem",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(0,102,255,0.3), rgba(51,153,255,0.3))",
          border: "1px solid rgba(0,102,255,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: APPLE_COLORS.accentLight,
          fontSize: "1.2rem",
        }}>
          <Icons.Chat/>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 2px 0", fontSize: "1rem", fontWeight: "700", color: APPLE_COLORS.text, display: "flex", gap: "1px", alignItems: "center" }}>
            Trauma <span style={{ color: "#00ffff", textShadow: "0 0 10px rgba(0,204,255,0.6)", fontWeight: 900, letterSpacing: "0.03em" }}>AI</span>D
          </h3>
          <p style={{ margin: 0, fontSize: "0.7rem", color: APPLE_COLORS.textSecondary, letterSpacing: "0.05em" }}>
            Always available to help
          </p>
        </div>
      </div>

      {/* Messages Container - SCROLLABLE */}
      <div ref={messagesContainerRef} style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        scrollBehavior: "smooth",
        minHeight: 0,
        gap: "12px",
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              alignItems: msg.sender === "bot" ? "flex-end" : "flex-start",
              animation: "slideUp 0.3s ease-out",
              flexShrink: 0,
              gap: "8px",
            }}
          >
            <div style={{
              maxWidth: "80%",
              ...glassCard,
              padding: "12px 14px",
              background: msg.sender === "user"
                ? "rgba(0,102,255,0.25)"
                : "rgba(255,255,255,0.08)",
              border: msg.sender === "user"
                ? "1px solid rgba(0,102,255,0.4)"
                : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1rem",
            }}>
              <p style={{
                margin: "0 0 4px 0",
                fontSize: "0.875rem",
                color: APPLE_COLORS.text,
                lineHeight: "1.4",
                wordWrap: "break-word",
              }}>
                {msg.text}
              </p>
              <p style={{
                margin: 0,
                fontSize: "0.65rem",
                color: APPLE_COLORS.textSecondary,
                opacity: 0.7,
              }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            flexShrink: 0,
          }}>
            <div style={{
              ...glassCard,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1rem",
            }}>
              <div style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "rgba(0,102,255,0.6)",
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} style={{ height: "1px", flexShrink: 0 }} />
      </div>

      {/* Input Area */}
      <div style={{
        ...glassCardStrong,
        borderRadius: "1.5rem 1.5rem 0 0",
        padding: "1rem",
        flexShrink: 0,
        borderBottom: "none",
        borderLeft: "none",
        borderRight: "none",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        gap: "10px",
        alignItems: "flex-end",
        boxSizing: "border-box",
        width: "100%",
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "1.25rem",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: APPLE_COLORS.text,
            fontSize: "0.875rem",
            outline: "none",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.target.style.background = "rgba(255,255,255,0.08)";
            e.target.style.borderColor = "rgba(0,102,255,0.3)";
          }}
          onBlur={(e) => {
            e.target.style.background = "rgba(255,255,255,0.05)";
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: inputValue.trim() && !isLoading
              ? "linear-gradient(135deg, rgba(0,102,255,0.4), rgba(51,153,255,0.4))"
              : "rgba(255,255,255,0.05)",
            color: inputValue.trim() && !isLoading ? APPLE_COLORS.accentLight : APPLE_COLORS.textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            flexShrink: 0,
            opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (inputValue.trim() && !isLoading) {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,102,255,0.6), rgba(51,153,255,0.6))";
            }
          }}
          onMouseLeave={(e) => {
            if (inputValue.trim() && !isLoading) {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,102,255,0.4), rgba(51,153,255,0.4))";
            }
          }}
        >
          <Icons.Send/>
        </button>
      </div>
    </div>
  );
}

// ─── Navigation Bar ───────────────────────────────────────────────────────────
function NavBar({ page, setPage, hasResult }) {
  const tabs = [
    { id: "home", label: "Home", Icon: Icons.Home },
    { id: "camera", label: "Scan", Icon: Icons.Camera },
    { id: "result", label: "Results", Icon: Icons.Activity },
    { id: "map", label: "Hospitals", Icon: Icons.MapPin },
    { id: "chat", label: "Chat", Icon: Icons.Chat },
  ];

  return (
    <div style={{
      position:"fixed",
      bottom:0,
      left:"50%",
      transform:"translateX(-50%)",
      width:"100%",
      maxWidth:"480px",
      display:"flex",
      background:"rgba(10,14,39,0.95)",
      backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(0,102,255,0.15)",
      padding:"8px 0 12px",
      flexShrink:0,
      zIndex:1000,
      justifyContent: "space-between",
      alignItems: "center",
      paddingRight: "12px",
      boxSizing:"border-box"
    }}>
      <div style={{display: "flex", flex: 1}}>
        {tabs.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              style={{
                flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                gap:4,padding:"6px 4px",background:"none",border:"none",
                cursor:"pointer",
                color: active ? "#0066ff" : "rgba(255,255,255,0.3)",
                transition:"color 0.2s",
                position:"relative",
              }}
            >
              {id === "result" && hasResult && !active && (
                <div style={{
                  position:"absolute",top:6,right:"calc(50% - 14px)",
                  width:6,height:6,borderRadius:"50%",background:"#ef4444",
                  animation:"pulse 2s ease-in-out infinite",
                }}/>
              )}
              <Icon/>
              <span style={{fontSize:"0.6rem",fontWeight: active ? 700 : 400,letterSpacing:"0.06em"}}>
                {label.toUpperCase()}
              </span>
              {active && (
                <div style={{
                  position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",
                  width:20,height:2,borderRadius:1,background:"#0066ff",
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      flex:1,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"2rem 1.5rem",
      background:"linear-gradient(135deg,#0a0e27 0%,#1a1f3a 40%,#0d1628 100%)",
      position:"relative",overflow:"hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position:"absolute",top:"15%",left:"20%",
        width:300,height:300,borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(0,102,255,0.12),transparent 70%)",
        filter:"blur(40px)",animation:"orb1 8s ease-in-out infinite",
      }}/>
      <div style={{
        position:"absolute",bottom:"20%",right:"15%",
        width:250,height:250,borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(51,153,255,0.1),transparent 70%)",
        filter:"blur(40px)",animation:"orb2 10s ease-in-out infinite",
      }}/>
      <div style={{
        position:"absolute",top:"60%",left:"10%",
        width:200,height:200,borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(0,102,255,0.06),transparent 70%)",
        filter:"blur(40px)",
      }}/>

      {/* Logo/Icon */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition:"all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display:"flex",flexDirection:"column",alignItems:"center",
        gap:"0.5rem",marginBottom:"2rem",
      }}>
        <div style={{
          width:80,height:80,borderRadius:24,
          background:"linear-gradient(135deg,rgba(0,102,255,0.2),rgba(51,153,255,0.15))",
          border:"1px solid rgba(0,102,255,0.3)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 40px rgba(0,102,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition:"all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
        textAlign:"center",marginBottom:"1rem",
      }}>
        <div style={{
          fontSize:"0.7rem",letterSpacing:"0.3em",fontWeight:600,
          color:"rgba(0,102,255,0.8)",marginBottom:"0.75rem",
          textTransform:"uppercase",
        }}>
          Emergency AI System
        </div>
        <h1 style={{
          fontSize:"clamp(2rem,8vw,3rem)",fontWeight:800,margin:0,
          background:"linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 50%,#0066ff 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          backgroundClip:"text",lineHeight:1.1,letterSpacing:"-0.02em",
        }}>
          Trauma<br/>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"2px"}}>
            <span style={{
              background:"linear-gradient(135deg,#00ffff,#0099ff)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              textShadow:"0 0 20px rgba(0,204,255,0.6)",
              filter:"drop-shadow(0 0 10px rgba(0,204,255,0.4))",
              fontWeight:900,
              letterSpacing:"0.05em",
            }}>A</span>
            <span style={{
              background:"linear-gradient(135deg,#00ffff,#0099ff)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              textShadow:"0 0 20px rgba(0,204,255,0.6)",
              filter:"drop-shadow(0 0 10px rgba(0,204,255,0.4))",
              fontWeight:900,
              letterSpacing:"0.05em",
            }}>I</span>
            <span style={{
              background:"linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.8))",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            }}>D</span>
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition:"all 0.7s ease 0.2s",
        textAlign:"center",marginBottom:"3rem",
      }}>
        <p style={{
          color:"rgba(255,255,255,0.4)",fontSize:"1rem",lineHeight:1.6,
          maxWidth:320,
        }}>
          Real-time AI-powered trauma detection and emergency guidance system
        </p>
      </div>

      {/* CTA Button */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        transition:"all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
        width:"100%",maxWidth:320,marginBottom:"1.5rem",
      }}>
        <button
          onClick={() => setPage("camera")}
          style={{
            width:"100%",padding:"18px 32px",
            background:"linear-gradient(135deg,#0066ff,#003d99)",
            border:"none",borderRadius:16,
            color:"#fff",fontWeight:700,fontSize:"1rem",
            cursor:"pointer",letterSpacing:"0.05em",
            boxShadow:"0 8px 32px rgba(0,102,255,0.4), 0 2px 8px rgba(0,102,255,0.3)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            transition:"all 0.2s",position:"relative",overflow:"hidden",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,102,255,0.5), 0 4px 12px rgba(0,102,255,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,102,255,0.4), 0 2px 8px rgba(0,102,255,0.3)";
          }}
        >
          <Icons.Scan/>
          START EMERGENCY SCAN
        </button>
      </div>

      {/* Feature pills */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition:"opacity 0.7s ease 0.5s",
        display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",
      }}>
        {["AI Detection","Voice Guidance","Hospital Finder","Offline Support"].map((f,i) => (
          <span key={i} style={{
            padding:"4px 12px",borderRadius:20,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",
            letterSpacing:"0.05em",
          }}>
            {f}
          </span>
        ))}
      </div>

      {/* Bottom disclaimer */}
      <div style={{
        position:"absolute",bottom:16,left:0,right:0,textAlign:"center",
        opacity: visible ? 0.3 : 0,transition:"opacity 1s ease 0.8s",
      }}>
        <p style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",letterSpacing:"0.05em"}}>
          ⚠ Always call 112 first in life-threatening emergencies in India
        </p>
      </div>
    </div>
  );
}

// ─── Camera Page ──────────────────────────────────────────────────────────────
function CameraPage({ onResult, latestResult, setPage }) {
  const [cameraError, setCameraError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking"); // "checking" | "online" | "offline"

  // Check backend health on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/health", { method: "GET", signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? "online" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (latestResult) setShowPanel(true);
  }, [latestResult]);

  const statusBar = {
    checking: { bg: "rgba(255,149,0,0.15)", border: "rgba(255,149,0,0.4)", color: "#ffb84d", text: "⏳ Checking backend..." },
    online:   { bg: "rgba(0,204,136,0.12)", border: "rgba(0,204,136,0.35)", color: "#66dd99", text: "✅ Backend online — ready to scan" },
    offline:  { bg: "rgba(255,59,48,0.15)",  border: "rgba(255,59,48,0.4)",  color: "#ff9999", text: "❌ Backend offline — run: cd VLM && uvicorn main:app --reload" },
  }[backendStatus];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",background:"#000"}}>

      {/* Backend status banner */}
      <div style={{
        position:"absolute",top:12,left:12,right:12,zIndex:30,
        background: statusBar.bg,
        border: `1px solid ${statusBar.border}`,
        borderRadius: 10,
        padding: "7px 12px",
        fontSize: "0.7rem",
        color: statusBar.color,
        fontWeight: 600,
        letterSpacing: "0.04em",
        backdropFilter: "blur(8px)",
      }}>
        {statusBar.text}
      </div>

      {/* Full-screen camera */}
      <div style={{flex:1,position:"relative"}}>
        {cameraError ? (
          <div style={{
            flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:"1rem",
            background:"linear-gradient(135deg,#0a0e27,#1a1f3a)",padding:"2rem",
          }}>
            <div style={{color:"#ef4444",opacity:0.6,fontSize:"2rem"}}>⚠</div>
            <p style={{color:"rgba(255,255,255,0.7)",textAlign:"center",fontSize:"0.875rem"}}>
              {cameraError}
            </p>
            <p style={{color:"rgba(255,255,255,0.3)",textAlign:"center",fontSize:"0.75rem"}}>
              Using simulated detection mode
            </p>
          </div>
        ) : (
          
          <CameraFeed onResult={onResult} onError={setCameraError}/>
        )}
      </div>

      {/* Slide-up result preview */}
      {showPanel && latestResult && (
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,
          ...glassCard,borderRadius:"1rem 1rem 0 0",
          padding:"1rem",
          transform:"translateY(0)",
          animation:"slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          maxHeight:"40%",overflowY:"auto",
        }}>
          <div style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem",
          }}>
            <div style={{
              display:"flex",alignItems:"center",gap:8,
              fontSize:"0.8rem",fontWeight:700,color:"rgba(255,255,255,0.9)",
              letterSpacing:"0.08em",
            }}>
              <Icons.Activity/>
              DETECTION RESULT
            </div>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background:"rgba(255,255,255,0.06)",border:"none",
                borderRadius:8,width:28,height:28,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",color:"rgba(255,255,255,0.5)",
              }}
            >
              <Icons.X/>
            </button>
          </div>

          {(() => {
            const sevKey = latestResult.severity?.toLowerCase();
            const colors = COLORS[sevKey] || COLORS.low;
            return (
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{
                  padding:"8px 14px",borderRadius:10,
                  background:`${colors.accent}15`,
                  border:`1px solid ${colors.accent}30`,
                }}>
                  <div style={{
                    fontSize:"0.65rem",fontWeight:700,color:colors.text,
                    letterSpacing:"0.12em",marginBottom:2,
                  }}>{latestResult.severity}</div>
                  <div style={{fontSize:"1rem",fontWeight:700,color:"rgba(255,255,255,0.9)"}}>
                    {latestResult.injury}
                  </div>
                </div>
                <div style={{flex:1,fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>
                  {latestResult.instructions[0]}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function ResultPanel({ result, onSeverityUpdate }) {
  if (!result) return (
    <div style={{...glassCard,padding:"2rem",textAlign:"center"}}>
      <div style={{color:"rgba(255,255,255,0.15)",marginBottom:"1rem",fontSize:"2rem"}}>◎</div>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:"0.875rem",letterSpacing:"0.05em"}}>
        Awaiting detection results...
      </p>
    </div>
  );

  const sevKey = result.severity?.toLowerCase();
  const colors = COLORS[sevKey] || COLORS.low;

  return (
    <div style={{
      ...glassCard,
      borderColor: `${colors.accent}30`,
      background: `${colors.bg}cc`,
      padding:"1.25rem",
    }}>
      {/* Low confidence warning banner */}
      {result.low_confidence && (
        <div style={{
          background:"rgba(255,149,0,0.12)",
          border:"1px solid rgba(255,149,0,0.35)",
          borderRadius:10,padding:"8px 12px",
          marginBottom:"0.75rem",
          display:"flex",alignItems:"center",gap:8,
        }}>
          <span style={{fontSize:"1rem"}}>⚠️</span>
          <div>
            <p style={{margin:0,fontSize:"0.72rem",fontWeight:700,color:"#ffb84d",letterSpacing:"0.04em"}}>
              LOW CONFIDENCE SCAN
            </p>
            <p style={{margin:0,fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",marginTop:2}}>
              Better lighting or a closer shot will improve accuracy
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1rem"}}>
        <div>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:`${colors.accent}20`,
            border:`1px solid ${colors.accent}40`,
            padding:"3px 10px",borderRadius:20,
            fontSize:"0.65rem",fontWeight:700,color:colors.text,
            letterSpacing:"0.12em",marginBottom:8,
          }}>
            <div style={{
              width:6,height:6,borderRadius:"50%",
              background:colors.accent,
              animation: result.severity === "CRITICAL" ? "pulse 1s ease-in-out infinite" : "none",
            }}/>
            {result.severity}
          </div>
          <h3 style={{
            fontSize:"1.25rem",fontWeight:700,
            color:"rgba(255,255,255,0.95)",margin:0,
          }}>{result.injury}</h3>
          <p style={{
            fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",
            marginTop:4,letterSpacing:"0.05em",
          }}>
            Region: {result.region} · Confidence: {result.confidence}%
          </p>
        </div>
        <div style={{
          width:48,height:48,borderRadius:"50%",
          background:`${colors.accent}15`,
          border:`2px solid ${colors.accent}40`,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:colors.accent,
          boxShadow:`0 0 20px ${colors.glow}`,
        }}>
          <Icons.AlertTriangle/>
        </div>
      </div>

      {/* Severity bar */}
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em"}}>
            SEVERITY LEVEL
          </span>
          <span style={{fontSize:"0.65rem",color:colors.text,fontWeight:700,letterSpacing:"0.1em"}}>
            {result.severity}
          </span>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
          <div style={{
            height:"100%",borderRadius:2,
            background:`linear-gradient(90deg,${colors.accent}80,${colors.accent})`,
            width: result.severity==="CRITICAL" ? "100%" : result.severity==="MODERATE" ? "60%" : "30%",
            transition:"width 1s ease",
            boxShadow:`0 0 8px ${colors.glow}`,
          }}/>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <p style={{
          fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.1em",
          color:"rgba(255,255,255,0.5)",marginBottom:"0.75rem",
        }}>
          EMERGENCY INSTRUCTIONS
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {result.instructions.map((step, i) => (
            <div key={i} style={{
              display:"flex",alignItems:"flex-start",gap:10,
              padding:"8px 10px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:10,
            }}>
              <span style={{
                flexShrink:0,width:20,height:20,borderRadius:6,
                background:`${colors.accent}20`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"0.65rem",fontWeight:700,color:colors.text,
              }}>{i+1}</span>
              <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency call button */}
      <button style={{
        width:"100%",marginTop:"1rem",padding:"12px",
        background:"rgba(239,68,68,0.15)",
        border:"1px solid rgba(239,68,68,0.4)",
        borderRadius:12,
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        color:"#fca5a5",fontWeight:700,fontSize:"0.875rem",
        cursor:"pointer",letterSpacing:"0.05em",
        transition:"all 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.25)"}
      onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.15)"}
      onClick={() => window.location.href = "tel:112"}
      >
        <Icons.Phone/> CALL 112 (EMERGENCY)
      </button>
    </div>
  );
}


// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [detectionResult, setDetectionResult] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationCity, setLocationCity] = useState(null);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [locationStatus, setLocationStatus] = useState("waiting");
  const [assessmentComplete, setAssessmentComplete] = useState(false); // waiting, tracking, error
  const watchIdRef = useRef(null);

  // Real-time location tracking with watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported on this device");
      setLocationStatus("error");
      return;
    }

    console.log("📍 Starting real-time location tracking...");
    setLocationStatus("tracking");

    const successCallback = (pos) => {
      try {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(`✅ Location updated: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${accuracy.toFixed(0)}m)`);
        
        setLocation({ lat: latitude, lng: longitude, accuracy });
        setLocationStatus("tracking");
        
        const nearestCity = findNearestCity(latitude, longitude);
        setLocationCity(nearestCity);
      } catch (error) {
        console.error("❌ Error processing location:", error);
        setLocationStatus("error");
      }
    };

    const errorCallback = (error) => {
      console.error(`❌ Geolocation error (${error.code}): ${error.message}`);
      setLocationStatus("error");
      
      // Show user-friendly error message
      switch (error.code) {
        case 1:
          console.error("User denied geolocation permission.");
          break;
        case 2:
          console.error("Position unavailable. Check GPS signal.");
          break;
        case 3:
          console.error("Geolocation timeout. Please try again.");
          break;
      }
    };

    // Start watching position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Always get fresh location
      }
    );

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log("📍 Location tracking stopped");
      }
    };
  }, []);

  const handleDetectionResult = useCallback((result) => {
  setDetectionResult(result);
  setSeverity(result.severity);
  setAssessmentComplete(false); // reset for new scan
  setPage("result");
}, []);

  const handleSeverityUpdate = useCallback((newSeverity) => {
    setSeverity(newSeverity);
    setDetectionResult(prev => prev ? {...prev, severity: newSeverity} : prev);
  }, []);

  // Navigate to result when detection happens
  useEffect(() => {
    if (detectionResult && page === "camera") {
      // Don't auto-navigate; show preview panel instead
    }
  }, [detectionResult, page]);

  return (
    <div style={{
      height:"100vh",maxHeight:"100vh",
      display:"flex",flexDirection:"column",
      fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      background:"#0a0e27",
      color:"#fff",
      overflow:"hidden",
      maxWidth:"480px",
      margin:"0 auto",
      position:"relative",
      boxSizing:"border-box",
      width:"100%"
    }}>
      {/* CSS keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100% { opacity:1; transform: scale(1); }
          50% { opacity:0.6; transform: scale(0.95); }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          51% { top: 100%; opacity:0; }
          52% { top: 0%; opacity:0; }
          53% { opacity:1; }
          100% { top: 0%; }
        }
        @keyframes fadeInBox {
          from { opacity:0; transform: scale(0.96); }
          to { opacity:1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity:0; }
          to { transform: translateY(0); opacity:1; }
        }
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-15px) scale(1.05); }
          66% { transform: translate(-15px,10px) scale(0.95); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-20px,15px) scale(1.08); }
          70% { transform: translate(15px,-10px) scale(0.92); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(129,140,248,0.3); border-radius: 2px; }
        button { outline: none; }
      `}</style>

      {/* Status bar simulation */}
      <div style={{
        height:4,
        background:"linear-gradient(90deg,#0066ff,#003d99,#0066ff)",
        opacity:0.6,flexShrink:0,
      }}/>

      {/* Page content */}
      <div style={{
        flex:1,
        display:"flex",
        flexDirection:"column",
        position:"relative",
        width:"100%",
        boxSizing:"border-box",
        minHeight: 0
      }}>
        {page === "home" && <HomePage setPage={setPage}/>}
        {page === "camera" && (
          <CameraPage 
  onResult={handleDetectionResult} 
  latestResult={detectionResult}
  setPage={setPage}
/>
        )}
        {page === "result" && (
  <ResultPage
    result={detectionResult}
    onSeverityUpdate={handleSeverityUpdate}
    assessmentComplete={assessmentComplete}
    setAssessmentComplete={setAssessmentComplete}
  />
)}
        {page === "map" && <MapPage location={location} locationCity={locationCity}/>}
        {page === "chat" && <ChatPage/>}
      </div>

      {/* Location Editor Modal */}
      {showLocationEditor && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#0a0e27", borderRadius: 16, padding: "1.5rem",
            border: "1px solid rgba(0,102,255,0.3)", maxWidth: 320,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <p style={{fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "1rem"}}>
              📍 Select Your City (Backup)
            </p>
            <p style={{fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem"}}>
              Click location at the top of the map to edit
            </p>
            <button onClick={() => setShowLocationEditor(false)} style={{
              width: "100%", padding: "0.75rem", borderRadius: 8,
              background: "#0066ff", border: "none",
              color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <NavBar page={page} setPage={setPage} hasResult={!!detectionResult}/>
    </div>
  );
}