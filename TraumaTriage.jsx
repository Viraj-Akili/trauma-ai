/**
 * TraumaTriage AI - Production-Level Emergency Trauma Detection System
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
      "Call 911 / emergency services immediately",
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

// Hospital data with realistic information
const MOCK_HOSPITALS = [
  { 
    name: "City General Hospital", 
    dist: "0.8 km", 
    time: "4 min", 
    type: "Emergency Trauma Center", 
    open: true,
    phone: "+1 (555) 201-3456",
    address: "123 Medical Drive, Downtown",
    rating: 4.8
  },
  { 
    name: "Regional Medical Center", 
    dist: "1.4 km", 
    time: "7 min", 
    type: "Level I Trauma Center", 
    open: true,
    phone: "+1 (555) 234-5678",
    address: "456 Health Park Ave",
    rating: 4.9
  },
  { 
    name: "St. Mary's Emergency", 
    dist: "2.1 km", 
    time: "11 min", 
    type: "Emergency Department", 
    open: true,
    phone: "+1 (555) 345-6789",
    address: "789 Care Boulevard",
    rating: 4.7
  },
  { 
    name: "Memorial Hospital", 
    dist: "3.2 km", 
    time: "15 min", 
    type: "General Hospital", 
    open: false,
    phone: "+1 (555) 456-7890",
    address: "321 Wellness Street",
    rating: 4.6
  },
];

// Chatbot responses
const CHATBOT_RESPONSES = {
  greetings: [
    "Hello! I'm TraumaTriage AI. How can I help you today?",
    "Hi there! I'm here to assist with emergency information. What do you need?",
    "Welcome to TraumaTriage Emergency Support. How can I assist?",
  ],
  trauma: [
    "I can help with trauma information. Common emergency types include wounds, fractures, and head injuries. What specific type of injury do you want to know about?",
    "Trauma response depends on the severity. Do you need information about wound care, CPR, or something else?",
  ],
  location: [
    "Your current location is being used to find the nearest hospitals. I can help you navigate to emergency care.",
    "For location-based emergency services, please enable location access in your device settings.",
  ],
  hospital: [
    "I found several hospitals near you. The closest is City General Hospital at 0.8 km away. Would you like more details?",
    "Let me show you the nearest hospitals with contact information and wait times.",
  ],
  unknown: [
    "I'm not sure about that. Can you tell me if you need emergency trauma help, hospital information, or first aid guidance?",
    "I specialize in emergency assistance. Could you clarify what emergency help you need?",
    "That's outside my expertise, but I can help with trauma detection and emergency services.",
  ],
};

async function callDetectAPI(imageBlob) {
  // Simulate API latency
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  // In production, replace with:
  // const formData = new FormData();
  // formData.append('frame', imageBlob);
  // const res = await fetch('/detect', { method: 'POST', body: formData });
  // return res.json();

  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

// Simple chatbot logic
function getChatbotResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  if (message.includes("hi") || message.includes("hello") || message.includes("hey")) {
    return CHATBOT_RESPONSES.greetings[Math.floor(Math.random() * CHATBOT_RESPONSES.greetings.length)];
  } else if (message.includes("trauma") || message.includes("wound") || message.includes("injury")) {
    return CHATBOT_RESPONSES.trauma[Math.floor(Math.random() * CHATBOT_RESPONSES.trauma.length)];
  } else if (message.includes("location") || message.includes("where")) {
    return CHATBOT_RESPONSES.location[Math.floor(Math.random() * CHATBOT_RESPONSES.location.length)];
  } else if (message.includes("hospital") || message.includes("emergency") || message.includes("doctor")) {
    return CHATBOT_RESPONSES.hospital[Math.floor(Math.random() * CHATBOT_RESPONSES.hospital.length)];
  } else {
    return CHATBOT_RESPONSES.unknown[Math.floor(Math.random() * CHATBOT_RESPONSES.unknown.length)];
  }
}

// ─── Utility Hooks ────────────────────────────────────────────────────────────
function useVoiceSpeech() {
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;
    // Prefer a calm, clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Samantha") || v.lang === "en-US"
    );
    if (preferred) u.voice = preferred;
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  const replay = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utteranceRef.current);
    }
  }, []);

  const stop = useCallback(() => window.speechSynthesis?.cancel(), []);

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
    if (!videoRef.current || !canvasRef.current || detecting) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    setDetecting(true);
    setFrameCount(n => n + 1);
    try {
      canvas.toBlob(async (blob) => {
        const result = await callDetectAPI(blob);
        setLocalResult(result);
        onResult?.(result);
        setDetecting(false);
      }, "image/jpeg", 0.8);
    } catch {
      setDetecting(false);
    }
  }, [detecting, onResult]);

  // Auto-detect every 3 seconds
  useEffect(() => {
    if (cameraActive) {
      timerRef.current = setInterval(captureAndDetect, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [cameraActive, captureAndDetect]);

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
      <canvas ref={canvasRef} style={{display:"none"}}/>
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
function QnAPanel({ result, onSeverityUpdate }) {
  const questions = [
    { id: "conscious", text: "Is the person conscious?", yesEffect: null, noEffect: "CRITICAL" },
    { id: "breathing", text: "Is the person breathing?", yesEffect: null, noEffect: "CRITICAL" },
    { id: "bleeding", text: "Is there visible bleeding?", yesEffect: "CRITICAL", noEffect: null },
    { id: "responsive", text: "Are they responsive to voice?", yesEffect: null, noEffect: "MODERATE" },
  ];

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (qId, answer) => {
    const q = questions.find(q => q.id === qId);
    setAnswers(prev => ({...prev, [qId]: answer}));

    // Update severity based on critical indicators
    if (answer === "no" && q.noEffect === "CRITICAL") {
      onSeverityUpdate?.("CRITICAL");
    } else if (answer === "yes" && q.yesEffect === "CRITICAL") {
      onSeverityUpdate?.("CRITICAL");
    }

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(n => n + 1), 400);
    }
  };

  const activeQ = questions[currentQ];
  const isAnswered = answers[activeQ?.id] !== undefined;

  return (
    <div style={{...glassCard,padding:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        <div style={{
          width:28,height:28,borderRadius:8,
          background:"rgba(129,140,248,0.15)",
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"#818cf8",
        }}>
          <Icons.Activity/>
        </div>
        <span style={{fontSize:"0.8rem",fontWeight:600,color:"rgba(255,255,255,0.9)",letterSpacing:"0.08em"}}>
          PATIENT ASSESSMENT
        </span>
        <span style={{
          marginLeft:"auto",fontSize:"0.7rem",
          color:"rgba(255,255,255,0.4)",
        }}>{Object.keys(answers).length}/{questions.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1,marginBottom:"1rem"}}>
        <div style={{
          height:"100%",borderRadius:1,
          background:"linear-gradient(90deg,#0066ff,#3399ff)",
          width:`${(Object.keys(answers).length / questions.length) * 100}%`,
          transition:"width 0.4s ease",
        }}/>
      </div>

      {/* Previous answers */}
      {questions.slice(0, currentQ).map((q) => (
        <div key={q.id} style={{
          display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",
          marginBottom:4,
        }}>
          <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.35)"}}>{q.text}</span>
          <span style={{
            fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.08em",
            color: answers[q.id] === "yes" ? "#10b981" : "#f87171",
          }}>
            {answers[q.id]?.toUpperCase()}
          </span>
        </div>
      ))}

      {/* Active question */}
      {activeQ && !isAnswered && (
        <div style={{marginTop:8}}>
          <p style={{
            fontSize:"0.875rem",color:"rgba(255,255,255,0.9)",
            marginBottom:"0.875rem",lineHeight:1.5,
          }}>
            {activeQ.text}
          </p>
          <div style={{display:"flex",gap:8}}>
            {["yes","no"].map(ans => (
              <button
                key={ans}
                onClick={() => handleAnswer(activeQ.id, ans)}
                style={{
                  flex:1,padding:"10px",
                  background: ans === "yes"
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.12)",
                  border: `1px solid ${ans === "yes" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius:10,
                  color: ans === "yes" ? "#6ee7b7" : "#fca5a5",
                  fontWeight:700,fontSize:"0.875rem",
                  cursor:"pointer",letterSpacing:"0.08em",
                  transition:"all 0.15s",
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

      {currentQ >= questions.length && (
        <div style={{
          display:"flex",alignItems:"center",gap:8,
          padding:"10px",
          background:"rgba(16,185,129,0.08)",
          border:"1px solid rgba(16,185,129,0.2)",
          borderRadius:10,marginTop:8,
        }}>
          <Icons.Check/>
          <span style={{fontSize:"0.8rem",color:"#6ee7b7",fontWeight:500}}>Assessment complete</span>
        </div>
      )}
    </div>
  );
}

// ─── Voice Guide Component ────────────────────────────────────────────────────
function VoiceGuide({ result, onReplay }) {
  const [speaking, setSpeaking] = useState(false);

  if (!result) return null;

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
      <button
        onClick={() => { setSpeaking(true); onReplay?.(); setTimeout(()=>setSpeaking(false), 4000); }}
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
  );
}

// ─── Result Panel Component ───────────────────────────────────────────────────
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
      onClick={() => window.location.href = "tel:911"}
      >
        <Icons.Phone/> CALL EMERGENCY SERVICES (911)
      </button>
    </div>
  );
}

// ─── Map Page ─────────────────────────────────────────────────────────────────
function MapPage({ location }) {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setMapLoaded(true), 800);
  }, []);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      {/* Simulated map background */}
      <div style={{
        flex:1,position:"relative",
        background:"linear-gradient(135deg,#0d1117 0%,#0f172a 50%,#0d1117 100%)",
        overflow:"hidden",
      }}>
        {/* Map grid lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.15}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#818cf8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          {/* Simulated roads */}
          {[30,45,60,70,80].map((y,i) => (
            <line key={i} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#334155" strokeWidth="6" opacity="0.6"/>
          ))}
          {[20,40,55,75].map((x,i) => (
            <line key={i} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#334155" strokeWidth="4" opacity="0.5"/>
          ))}
          {/* Building blocks */}
          {[[10,10,15,12],[25,25,20,15],[50,15,18,20],[65,35,22,18],[15,50,18,15],[35,60,20,12],[55,55,18,20],[75,20,15,15],[80,50,16,18]].map(([x,y,w,h],i) => (
            <rect key={i} x={`${x}%`} y={`${y}%`} width={`${w}%`} height={`${h}%`} rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.5"/>
          ))}
        </svg>

        {/* Hospital markers */}
        {MOCK_HOSPITALS.map((h, i) => {
          const positions = [[38,42],[52,58],[65,30],[25,70]];
          const [mx, my] = positions[i];
          return (
            <button
              key={i}
              onClick={() => setSelectedHospital(h)}
              style={{
                position:"absolute",left:`${mx}%`,top:`${my}%`,
                transform:"translate(-50%,-50%)",
                background: selectedHospital?.name === h.name
                  ? "#818cf8"
                  : h.open ? "rgba(16,185,129,0.9)" : "rgba(100,116,139,0.9)",
                border: selectedHospital?.name === h.name ? "3px solid #fff" : "2px solid rgba(255,255,255,0.3)",
                borderRadius:"50%",width:32,height:32,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",cursor:"pointer",
                boxShadow:`0 0 20px ${h.open ? "rgba(16,185,129,0.5)" : "rgba(0,0,0,0.3)"}`,
                transition:"all 0.2s",zIndex:2,
                fontSize:14,
              }}
              title={h.name}
            >
              +
            </button>
          );
        })}

        {/* User location */}
        <div style={{
          position:"absolute",left:"50%",top:"50%",
          transform:"translate(-50%,-50%)",
          zIndex:3,
        }}>
          <div style={{
            width:16,height:16,borderRadius:"50%",
            background:"#818cf8",
            border:"3px solid #fff",
            boxShadow:"0 0 0 8px rgba(129,140,248,0.2)",
          }}/>
        </div>

        {/* Location info */}
        <div style={{
          position:"absolute",top:16,left:16,right:16,
          ...glassCard,padding:"10px 14px",
          display:"flex",alignItems:"center",gap:10,
        }}>
          <Icons.MapPin/>
          <div>
            <p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.9)",fontWeight:600}}>
              Your Location
            </p>
            <p style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)"}}>
              {location
                ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                : "Acquiring GPS coordinates..."}
            </p>
          </div>
          {!location && (
            <div style={{marginLeft:"auto"}}>
              <div style={{
                width:16,height:16,borderRadius:"50%",
                border:"2px solid transparent",
                borderTopColor:"#818cf8",
                animation:"spin 1s linear infinite",
              }}/>
            </div>
          )}
        </div>
      </div>

      {/* Hospital list */}
      <div style={{
        ...glassCard,borderRadius:0,borderLeft:"none",borderRight:"none",borderBottom:"none",
        padding:"1rem",maxHeight:"45vh",overflowY:"auto",
      }}>
        <p style={{
          fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.1em",
          color:"rgba(255,255,255,0.4)",marginBottom:"0.75rem",
        }}>
          NEARBY TRAUMA CENTERS — {MOCK_HOSPITALS.length} FOUND
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {MOCK_HOSPITALS.map((h, i) => (
            <div
              key={i}
              onClick={() => setSelectedHospital(h)}
              style={{
                padding:"12px",borderRadius:12,cursor:"pointer",
                border: selectedHospital?.name === h.name
                  ? "1px solid rgba(0,102,255,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: selectedHospital?.name === h.name
                  ? "rgba(0,102,255,0.08)"
                  : "rgba(255,255,255,0.02)",
                transition:"all 0.2s",
              }}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{
                      width:8,height:8,borderRadius:"50%",flexShrink:0,
                      background: h.open ? "#00cc88" : "#94a3b8",
                    }}/>
                    <span style={{fontSize:"0.875rem",fontWeight:600,color:"rgba(255,255,255,0.95)"}}>
                      {h.name}
                    </span>
                  </div>
                  <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginLeft:16,marginBottom:6}}>
                    {h.type}
                  </p>
                  <div style={{marginLeft:16,display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <Icons.Phone/>
                    <a href={`tel:${h.phone.replace(/[^\d]/g, '')}`} style={{fontSize:"0.72rem",color:"#0066ff",fontWeight:500,textDecoration:"none",transition:"color 0.2s"}} onMouseEnter={e => e.target.style.color="#003d99"} onMouseLeave={e => e.target.style.color="#0066ff"}>
                      {h.phone}
                    </a>
                  </div>
                  <div style={{marginLeft:16,display:"flex",alignItems:"center",gap:4}}>
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star key={i} style={{opacity: i < Math.floor(h.rating) ? 1 : 0.3, color: "#ff9500"}}/>
                    ))}
                    <span style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginLeft:4}}>
                      {h.rating}
                    </span>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <p style={{fontSize:"0.875rem",fontWeight:700,color:"rgba(255,255,255,0.95)"}}>
                    {h.dist}
                  </p>
                  <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)"}}>
                    ≈ {h.time}
                  </p>
                  <p style={{fontSize:"0.65rem",color: h.open ? "#00cc88" : "#ff6b6b",fontWeight:600,marginTop:4}}>
                    {h.open ? "OPEN 24/7" : "CLOSED"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Page ────────────────────────────────────────────────────────────────
function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your TraumaTriage AI Assistant. How can I help you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(() => {
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

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getChatbotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 600);
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
      overflow: "hidden",
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
          <h3 style={{ margin: "0 0 2px 0", fontSize: "1rem", fontWeight: "700", color: APPLE_COLORS.text }}>
            TraumaTriage Assistant
          </h3>
          <p style={{ margin: 0, fontSize: "0.7rem", color: APPLE_COLORS.textSecondary, letterSpacing: "0.05em" }}>
            Always available to help
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        scrollBehavior: "smooth",
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              animation: "slideUp 0.3s ease-out",
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
        <div ref={messagesEndRef} />
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
      display:"flex",
      background:"rgba(10,14,39,0.95)",
      backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(0,102,255,0.15)",
      padding:"8px 0 12px",
      flexShrink:0,
      position:"relative",zIndex:100,
    }}>
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
          TraumaTriage<br/>
          <span style={{
            background:"linear-gradient(135deg,#0066ff,#003d99)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
          }}>AI</span>
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
          ⚠ Always call 911 first in life-threatening emergencies
        </p>
      </div>
    </div>
  );
}

// ─── Camera Page ──────────────────────────────────────────────────────────────
function CameraPage({ onResult, latestResult }) {
  const [cameraError, setCameraError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (latestResult) setShowPanel(true);
  }, [latestResult]);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",background:"#000"}}>
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

// ─── Result Page ──────────────────────────────────────────────────────────────
function ResultPage({ result, onSeverityUpdate }) {
  const { speak, replay } = useVoiceSpeech();

  // Auto-speak when result arrives
  useEffect(() => {
    if (result) {
      const text = `${result.severity} alert. ${result.injury} detected. ${result.instructions[0]}. ${result.instructions[1]}.`;
      speak(text);
    }
  }, [result, speak]);

  return (
    <div style={{
      flex:1,overflowY:"auto",
      background:"linear-gradient(160deg,#0a0e27 0%,#1a1f3a 100%)",
      padding:"1rem",display:"flex",flexDirection:"column",gap:"1rem",
    }}>
      {/* Header */}
      <div style={{
        display:"flex",alignItems:"center",gap:10,
        padding:"0.5rem 0",
      }}>
        <div style={{
          width:32,height:32,borderRadius:10,
          background:"rgba(129,140,248,0.15)",
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"#818cf8",
        }}>
          <Icons.Activity/>
        </div>
        <div>
          <h2 style={{margin:0,fontSize:"1.1rem",fontWeight:700,color:"rgba(255,255,255,0.95)"}}>
            Analysis Results
          </h2>
          <p style={{margin:0,fontSize:"0.7rem",color:"rgba(255,255,255,0.35)",letterSpacing:"0.06em"}}>
            {result ? "DETECTION COMPLETE" : "AWAITING SCAN"}
          </p>
        </div>
      </div>

      <ResultPanel result={result} onSeverityUpdate={onSeverityUpdate}/>
      <VoiceGuide result={result} onReplay={replay}/>
      {result && <QnAPanel result={result} onSeverityUpdate={onSeverityUpdate}/>}

      {/* Info disclaimer */}
      <div style={{
        ...glassCard,padding:"12px",
        display:"flex",gap:10,alignItems:"flex-start",
      }}>
        <div style={{color:"rgba(255,255,255,0.3)",flexShrink:0,marginTop:1}}>
          <Icons.Info/>
        </div>
        <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.3)",lineHeight:1.5,margin:0}}>
          AI detection is for guidance only and does not replace professional medical assessment. Always call emergency services for life-threatening situations.
        </p>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [detectionResult, setDetectionResult] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [location, setLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 13.0827, lng: 80.2707 }) // Chennai fallback
      );
    }
  }, []);

  const handleDetectionResult = useCallback((result) => {
    setDetectionResult(result);
    setSeverity(result.severity);
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
      maxWidth:480,margin:"0 auto",
      position:"relative",
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
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
        {page === "home" && <HomePage setPage={setPage}/>}
        {page === "camera" && (
          <CameraPage onResult={handleDetectionResult} latestResult={detectionResult}/>
        )}
        {page === "result" && (
          <ResultPage result={detectionResult} onSeverityUpdate={handleSeverityUpdate}/>
        )}
        {page === "map" && <MapPage location={location}/>}
        {page === "chat" && <ChatPage/>}
      </div>

      {/* Navigation */}
      <NavBar page={page} setPage={setPage} hasResult={!!detectionResult}/>
    </div>
  );
}
