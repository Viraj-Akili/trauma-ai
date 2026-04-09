from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import io
import os
import requests
from pydantic import BaseModel
from typing import Dict

from rag import build_index, retrieve

app = FastAPI()

# ── CORS: allow Vite dev server to call the API ───────────────────────────────
# Using allow_origins=["*"] for local development convenience.
# Restrict this to specific origins before any production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}



OPENROUTER_API_KEY = "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"
print("🔑 API KEY LOADED:", OPENROUTER_API_KEY[:10] + "...")

# -------------------------------
# 🔥 LOAD MODEL
# -------------------------------
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# -------------------------------
# 🔥 LOAD RAG DATA
# -------------------------------
pdf_files = [
    "data/pdf1.pdf",
    "data/pdf3.pdf",
    "data/pdf5.pdf",
    "data/pdf2.pdf"
]

urls = [
    "https://medlineplus.gov/firstaid.html",
    "https://medlineplus.gov/burns.html",
    "https://medlineplus.gov/woundsandinjuries.html",
    "https://www.who.int/health-topics/injuries",
    "https://www.mayoclinic.org/first-aid"
]

try:
    print("🔄 Building RAG index...")
    index, chunks = build_index(pdf_files, urls)
    print("✅ RAG loaded successfully")
except Exception as e:
    print("❌ RAG ERROR:", e)
    print("⚠️ App will run without RAG context")
    index, chunks = None, []

# -------------------------------
# 🔥 LABELS
# -------------------------------
injury_labels = [
    "person with heavy bleeding from arm",
    "person with deep cut on leg bleeding",
    "person with bleeding head wound",
    "person with bleeding hand injury",
    "person with bleeding foot injury",
    "person with minor cut on finger",

    "person with burn on hand",
    "person with burn on face",
    "person with severe burn with blisters",
    "person with hot liquid burn",

    "person with broken arm unable to move",
    "person with broken leg unable to stand",
    "person holding arm in pain possible fracture",
    "person with wrist fracture swelling",

    "person with twisted ankle swelling",
    "person limping due to leg injury",
    "person with knee injury swelling",

    "person hit head and bleeding",
    "person with head injury confusion",
    "person feeling dizzy after head hit",

    "person choking holding throat",
    "person unable to breathe gasping",
    "person having breathing difficulty",

    "person holding chest in pain",
    "person with severe chest pain sweating",

    "person injured in road accident",
    "person fallen from height injured",
    "person lying injured after fall",

    "person unconscious not responding",
    "person fainted and collapsed",
    "person not moving emergency"
]

posture_labels = [
    "person standing",
    "person sitting",
    "person lying on ground",
    "person collapsed on floor",
    "person unconscious lying down",
    "person not moving",
    "person limping",
    "person holding arm",
    "person holding leg",
    "person gasping for air"
]

# -------------------------------
# 🔥 DETECTION
# -------------------------------
def detect_multi(image, labels, threshold=0.35, top_k=3):
    inputs = processor(text=labels, images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]

    top_probs, top_idxs = torch.topk(probs, k=top_k)

    results = []
    for p, idx in zip(top_probs, top_idxs):
        if p.item() > threshold:
            results.append({
                "label": labels[idx],
                "confidence": round(p.item(), 3)
            })

    if not results:
        best_idx = torch.argmax(probs).item()
        results.append({
            "label": labels[best_idx],
            "confidence": round(probs[best_idx].item(), 3)
        })

    return results

# -------------------------------
# 🔥 SEVERITY
# -------------------------------
# ── Injury category definitions ────────────────────────────────────────────
# Each entry: (keyword_list, base_score, min_severity_override)
# min_severity_override: if this injury is detected, severity is at least this level
# regardless of confidence (catches low-confidence CLIP on serious injuries)
INJURY_RULES = [
    # Critical regardless of confidence
    (["heavy bleeding", "bleeding head", "unconscious", "not moving"],     10, "critical"),
    (["choking", "not breathing", "gasping", "breathing difficulty"],       10, "critical"),
    (["chest pain", "severe chest"],                                         9, "critical"),
    # Burns: face/head burns are always at least moderate (WHO guideline)
    (["burn on face", "burn on head"],                                       8, "moderate"),
    (["severe burn", "burn with blister"],                                   8, "moderate"),
    (["burn on hand", "hot liquid burn"],                                    6, "moderate"),
    (["burn"],                                                               5, "moderate"),  # any burn = at least moderate
    # Head injuries
    (["head injury", "head wound", "dizzy after", "skull", "brain"],        8, "moderate"),
    # Fractures
    (["broken arm", "broken leg", "wrist fracture"],                        6, "moderate"),
    (["fracture", "unable to move", "unable to stand"],                     5, "moderate"),
    # Road / fall trauma
    (["road accident", "fallen from height", "lying injured"],              7, "moderate"),
    # Minor
    (["cut on finger", "minor cut", "twisted ankle", "sprain"],             2, "low"),
]

def compute_severity(injuries, posture, confidences):
    text = " ".join(injuries).lower()

    # Hard overrides first
    if "unconscious" in text or "not moving" in text or "not moving" in posture:
        return "critical"
    if "choking" in text or "not breathing" in text or "gasping" in text:
        return "critical"

    score = 0
    min_severity = "low"   # floor — can only go up

    severity_rank = {"low": 0, "moderate": 1, "critical": 2}

    for inj, conf in zip(injuries, confidences):
        inj_lower = inj.lower()
        for keywords, base, floor in INJURY_RULES:
            if any(kw in inj_lower for kw in keywords):
                # Use max(conf, 0.3) so low-confidence detections still score reasonably
                effective_conf = max(conf, 0.30)
                score += base * effective_conf
                if severity_rank[floor] > severity_rank[min_severity]:
                    min_severity = floor
                break   # use first matching rule per injury

    if "lying" in posture:
        score += 3

    # Compute from score
    if score >= 9:
        computed = "critical"
    elif score >= 4:
        computed = "moderate"
    else:
        computed = "low"

    # Return whichever is higher: score-derived or keyword floor
    if severity_rank[computed] >= severity_rank[min_severity]:
        return computed
    return min_severity

# -------------------------------
# 🔥 DOCTOR STYLE RESPONSE
# -------------------------------
def format_first_aid(chunks, injuries, posture, severity):

    text = " ".join(injuries).lower()

    response = {
        "condition": "",
        "risk": "",
        "actions": [],
        "red_flags": []
    }

    if "head injury" in text:
        response["condition"] = "Possible traumatic brain injury"
        response["risk"] = "Risk of internal bleeding and brain damage"
        response["actions"] = [
            "🚨 Call emergency services immediately",
            "Keep head and neck stable",
            "Monitor breathing",
            "Do not give food or water"
        ]
        response["red_flags"] = ["vomiting", "seizures", "unconsciousness"]

    elif "bleeding" in text:
        response["condition"] = "Active bleeding injury"
        response["risk"] = "Risk of shock due to blood loss"
        response["actions"] = [
            "Apply firm pressure",
            "Elevate wound",
            "Do not remove bandage",
            "Seek medical help"
        ]
        response["red_flags"] = ["bleeding not stopping", "pale skin"]

    elif "fracture" in text or "broken" in text:
        response["condition"] = "Suspected fracture"
        response["risk"] = "Possible internal damage"
        response["actions"] = [
            "Immobilize area",
            "Apply ice",
            "Avoid movement",
            "Go to hospital"
        ]

    else:
        response["condition"] = "General injury"
        response["risk"] = "Needs observation"
        response["actions"] = [
            "Check breathing",
            "Keep patient safe",
            "Seek medical advice"
        ]

    return response

# -------------------------------
# 🔥 QUESTIONS
# -------------------------------
def normalize_injuries(injuries):
    normalized = []

    for inj in injuries:
        i = inj.lower()

        if any(word in i for word in ["bleed", "blood", "cut"]):
            normalized.append("bleeding")

        elif any(word in i for word in ["head", "skull", "brain"]):
            normalized.append("head")

        elif any(word in i for word in ["burn", "fire", "heat"]):
            normalized.append("burn")

        elif any(word in i for word in ["fracture", "broken"]):
            normalized.append("fracture")

        elif any(word in i for word in ["choking", "breathing", "gasping"]):
            normalized.append("breathing_issue")

        else:
            normalized.append(i)

    return list(set(normalized))


def generate_questions(injuries, posture):
    injuries = normalize_injuries(injuries)
    questions = []

    rules = {
        "bleeding": [
            {"key": "heavy_bleeding", "question": "Is the bleeding heavy and continuous?"}
        ],
        "head": [
            {"key": "conscious", "question": "Is the person conscious?"},
            {"key": "vomiting", "question": "Is the person vomiting?"}
        ],
        "burn": [
            {"key": "burn_size", "question": "Is the burn larger than the palm of the hand?"}
        ],
        "fracture": [
            {"key": "movement", "question": "Can the person move the injured limb?"}
        ],
        "breathing_issue": [
            {"key": "breathing", "question": "Is the person breathing normally?"}
        ]
    }

    for inj in injuries:
        if inj in rules:
            questions.extend(rules[inj])

    # Add default breathing question only if not already added
    if not any(q["key"] == "breathing" for q in questions):
        questions.append({
            "key": "breathing",
            "question": "Is the person breathing normally?"
        })

    seen = set()
    unique_questions = []
    for q in questions:
        if q["key"] not in seen:
            unique_questions.append(q)
            seen.add(q["key"])

    return unique_questions
# -------------------------------
# 🔥 REFINE LOGIC
# -------------------------------
class RefineRequest(BaseModel):
    injuries: list
    posture: str
    severity: str
    answers: Dict[str, str]

def get_triage_level(severity):
    if severity == "critical":
        return {"level": "RED", "message": "Immediate life-threatening"}
    elif severity == "moderate":
        return {"level": "YELLOW", "message": "Urgent"}
    else:
        return {"level": "GREEN", "message": "Stable"}

def refine_assessment(injuries, posture, severity, answers):

    if answers.get("breathing") == "no":
        return "critical", "Patient not breathing"

    if answers.get("conscious") == "no":
        return "critical", "Loss of consciousness"

    if answers.get("heavy_bleeding") == "yes":
        return "critical", "Severe bleeding"

    return severity, "Stable but needs monitoring"
# -------------------------------
# 🔥 RAG ANSWER VIA OPENROUTER
# -------------------------------
def generate_rag_answer(query, chunks, severity='unknown'):
    if not chunks:
        return "No relevant medical info found. Please seek professional help immediately."

    context = "\n\n".join(chunks[:5])[:2000]

    # Extract injury name cleanly for the prompt
    injury_summary = query.split("First aid treatment for:")[1].split(".")[0].strip() if "First aid treatment for:" in query else query

    prompt = f"""You are an emergency medical first aid assistant trained on clinical guidelines.
Use ONLY the medical context provided below. Do NOT add information not in the context.

DETECTED INJURY: {injury_summary}
SEVERITY LEVEL: {severity.upper()}

Medical context:
{context}

Provide first aid guidance in EXACTLY this format (no extra text before or after):

Condition: [one sentence describing the injury]
Risk: [one sentence describing the main danger]
Steps:
1. [immediate action — most critical first]
2. [second action]
3. [third action]
4. [fourth action if needed]
5. [fifth action if needed]
Red Flags:
- [warning sign 1 that means get emergency help immediately]
- [warning sign 2]
- [warning sign 3]

Rules:
- Steps must be specific to {injury_summary}, not generic
- For burns: always mention cool water duration, do NOT use ice
- For bleeding: always mention direct pressure and elevation
- For fractures: always mention immobilisation
- For head injuries: always mention not moving the person
- Mark any step that requires calling 112 with 🚨
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Trauma AI"
            },
            json={
                "model": "openrouter/auto",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 500
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    except Exception as e:
        return """Condition: Unable to analyze via AI

Risk: Possible serious injury

Steps:
1. Check if the person is breathing
2. Control any bleeding immediately
3. Keep the person still and calm
4. Seek emergency medical help

Red Flags:
- Unconsciousness
- Difficulty breathing"""
# -------------------------------
# 🔥 DETECT ENDPOINT
# -------------------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))  # 🔥 Optimize for CLIP inference

    # Lower threshold to 0.15 — CLIP softmax over 30+ labels rarely exceeds 20-25%
    # detect_multi already has a best-label fallback so we always get a result.
    injury_results = detect_multi(image, injury_labels, threshold=0.15, top_k=3)
    low_confidence = all(i["confidence"] < 0.25 for i in injury_results)

    posture = detect_multi(image, posture_labels, 0.15, 1)[0]["label"]

    injury_names = [i["label"] for i in injury_results]
    confidences = [i["confidence"] for i in injury_results]

    severity = compute_severity(injury_names, posture, confidences)
    triage = get_triage_level(severity)

    # Build a specific query that retrieves better RAG chunks.
    # Extract clean injury terms (strip "person with/having" prefix for clarity)
    clean_injuries = [
        i.replace("person with ", "").replace("person having ", "").replace("person ", "")
        for i in injury_names
    ]
    query = (
        f"First aid treatment for: {', '.join(clean_injuries)}. "
        f"Patient posture: {posture}. Severity: {severity}. "
        f"What are the immediate emergency steps, risks, and warning signs?"
    )
    retrieved = retrieve(query, index, chunks) if index else []

    rag_answer = generate_rag_answer(query, retrieved, severity)
    questions = generate_questions(injury_names, posture)

    return {
        "posture": posture,
        "injuries_detected": injury_results,
        "severity": severity,
        "triage": triage,
        "rag_answer": rag_answer,
        "rag_sources": [chunk[:150] + "..." for chunk in retrieved[:3]],
        "questions": questions,
        "low_confidence": low_confidence  # flag for frontend to show warning
    }

# -------------------------------
# 🔥 REFINE ENDPOINT
# -------------------------------
@app.post("/refine")
def refine(data: RefineRequest):

    new_severity, reason = refine_assessment(
        data.injuries,
        data.posture,
        data.severity,
        data.answers
    )

    updated = format_first_aid([], data.injuries, data.posture, new_severity)

    return {
        "updated_severity": new_severity,
        "reason": reason,
        "updated_first_aid": updated
    }