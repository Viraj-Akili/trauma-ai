from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import io
import requests
import os
from dotenv import load_dotenv

from rag import build_index, retrieve

# ==========================================
# 🔐 ENVIRONMENT & SETUP
# ==========================================
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

print("✅ API Loaded")

app = FastAPI()

# ==========================================
# CORS MIDDLEWARE
# ==========================================
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

# ==========================================
# 🧠 VISION DETECTION (CLIP Model)
# ==========================================
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# ==========================================
# 📚 RAG INITIALIZATION
# ==========================================
pdf_files = [
    "data/pdf1.pdf",
    "data/pdf2.pdf",
    "data/pdf3.pdf",
    "data/pdf5.pdf"
]

urls = [
    "https://medlineplus.gov/firstaid.html",
    "https://medlineplus.gov/burns.html",
    "https://medlineplus.gov/woundsandinjuries.html",
    "https://www.who.int/health-topics/injuries",
    "https://www.mayoclinic.org/first-aid"
]

print("🔄 Building RAG...")
index, chunks = build_index(pdf_files, urls)
print("✅ RAG READY")

# ==========================================
# 🏷️ SEMANTIC INJURY LABELS (IMPROVED)
# Shorter, clearer labels for better CLIP accuracy
# ==========================================
injury_labels = [
    "heavy bleeding",
    "deep cut",
    "head wound with blood",
    "burn",
    "severe burn with blisters",
    "fracture",
    "broken bone",
    "swelling",
    "head injury bleeding",
    "choking",
    "breathing difficulty",
    "chest pain",
    "trauma injury",
    "unconscious person",
    "person collapsed",
]

# ==========================================
# 🔍 VISION ANALYZER: CLIP Detection
# ==========================================
def detect(image):
    """
    Detect injuries from image using CLIP vision model.
    Returns top 3 detections with confidence scores.
    """
    inputs = processor(text=injury_labels, images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]

    top_probs, top_idxs = torch.topk(probs, k=3)

    results = []
    for p, idx in zip(top_probs, top_idxs):
        results.append({
            "label": injury_labels[idx],
            "confidence": round(p.item(), 3)
        })

    return results


# ==========================================
# 🏥 TRIAGE ENGINE: Severity Scoring
# ==========================================
def compute_severity(detections):
    """
    Compute initial severity from vision detections.
    Critical conditions trigger immediate alerts.
    Otherwise, weighted scoring determines level.
    """
    score = 0

    for d in detections:
        label = d["label"].lower()
        conf = d["confidence"]

        # Critical patterns (absolute)
        if any(x in label for x in ["unconscious", "collapsed", "choking"]):
            return "critical"

        if any(x in label for x in ["breathing difficulty"]):
            return "critical"

        # Weighted severity scoring
        if "heavy bleeding" in label:
            score += 8 * conf
        elif any(x in label for x in ["bleeding", "deep cut"]):
            score += 6 * conf
        elif any(x in label for x in ["burn", "fracture", "broken"]):
            score += 5 * conf
        elif any(x in label for x in ["swelling", "pain", "trauma"]):
            score += 2 * conf
        else:
            score += 1 * conf

    # Map score to severity category
    if score >= 6:
        return "critical"
    elif score >= 3:
        return "moderate"
    else:
        return "low"


# ==========================================
# 🤖 QUESTION ENGINE: Structured Questions
# ==========================================
def generate_questions(detections):
    """
    Generate structured JSON questions based on detected injuries.
    Each question has an id, text, options, and type for easy frontend integration.
    """
    questions = []
    labels = [d["label"].lower() for d in detections]

    # Bleeding injury questions
    if any("bleeding" in l for l in labels):
        questions.append({
            "id": "bleeding_severity",
            "question": "How severe is the bleeding?",
            "options": ["minor", "moderate", "severe"],
            "type": "selection"
        })
        questions.append({
            "id": "bleeding_flow",
            "question": "Is the bleeding continuous or stopping?",
            "options": ["continuous", "intermittent", "stopped"],
            "type": "selection"
        })

    # Head injury questions
    if any(x in l for x in ["head injury", "head wound"] for l in labels):
        questions.append({
            "id": "consciousness",
            "question": "Is the person conscious and alert?",
            "options": ["yes", "drowsy", "unconscious"],
            "type": "selection"
        })
        questions.append({
            "id": "head_symptoms",
            "question": "Any dizziness, vomiting, or confusion?",
            "options": ["none", "mild", "severe"],
            "type": "selection"
        })

    # Burn injury questions
    if any("burn" in l for l in labels):
        questions.append({
            "id": "burn_cause",
            "question": "What caused the burn?",
            "options": ["heat", "chemical", "electrical", "friction"],
            "type": "selection"
        })
        questions.append({
            "id": "blisters",
            "question": "Are there blisters or deep tissue damage?",
            "options": ["no", "minor", "extensive"],
            "type": "selection"
        })

    # Fracture/bone injury questions
    if any(x in l for x in ["fracture", "broken"] for l in labels):
        questions.append({
            "id": "limb_movement",
            "question": "Can the affected limb move?",
            "options": ["full range", "limited", "immobile"],
            "type": "selection"
        })
        questions.append({
            "id": "deformity",
            "question": "Is the limb deformed or bent at odd angle?",
            "options": ["no", "slightly", "severely"],
            "type": "selection"
        })

    # Choking/airway emergency
    if any("choking" in l for l in labels):
        questions.append({
            "id": "airway_response",
            "question": "Can the person cough or make sounds?",
            "options": ["yes", "weak", "no"],
            "type": "selection"
        })

    # Fallback questions (no specific injury detected)
    if not questions:
        questions.append({
            "id": "general_pain",
            "question": "Is the person experiencing pain?",
            "options": ["none", "mild", "severe"],
            "type": "selection"
        })
        questions.append({
            "id": "consciousness_general",
            "question": "Is the person conscious and responsive?",
            "options": ["yes", "partially", "no"],
            "type": "selection"
        })

    return questions


# ==========================================
# 💊 SEVERITY REFINEMENT: Answer-Based Scoring
# ==========================================
def compute_answer_severity(answers):
    """
    Compute severity ONLY from user answers to structured questions.
    Does NOT recursively boost based on initial vision severity.
    
    Returns: (severity_level, numeric_score)
    """
    score = 0

    # Bleeding assessment
    if answers.get("bleeding_severity") == "severe":
        score += 4
    elif answers.get("bleeding_severity") == "moderate":
        score += 2
    
    # Consciousness (critical indicator)
    if answers.get("consciousness") == "unconscious":
        score += 5
    elif answers.get("consciousness") == "drowsy":
        score += 2
    
    # Head symptoms
    if answers.get("head_symptoms") == "severe":
        score += 3
    
    # Breathing difficulty
    if answers.get("breathing_difficulty") == "severe":
        score += 5
    
    # Choking/airway emergency
    if answers.get("airway_response") == "no":
        score += 5
    elif answers.get("airway_response") == "weak":
        score += 3
    
    # Limb immobility
    if answers.get("limb_movement") == "immobile":
        score += 3
    
    # Severe deformity
    if answers.get("deformity") == "severely":
        score += 3
    
    # General pain (minor factor)
    if answers.get("general_pain") == "severe":
        score += 1

    # Map answer-based score to severity
    if score >= 7:
        severity = "critical"
    elif score >= 3:
        severity = "moderate"
    else:
        severity = "low"

    return severity, score


# ==========================================
# 🤖 LLM INTEGRATION: OpenRouter API
# ==========================================
def call_llm(prompt):
    """
    Call OpenRouter API (GPT-4o-mini) for structured medical advice.
    """
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "TraumaAI"
    }

    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a cautious medical assistant. Do not hallucinate."},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        res_json = response.json()

        if "choices" in res_json:
            return res_json["choices"][0]["message"]["content"]

        return "Condition: Uncertain\nRisk: Low\nSteps:\n1. Retry\nRed Flags:\n- Severe symptoms"

    except Exception as e:
        print("❌ LLM ERROR:", e)
        return "Condition: Error\nRisk: Unknown\nSteps:\n1. Retry\nRed Flags:\n- Severe symptoms"


def clean_steps(text):
    """Strip markdown formatting from LLM responses."""
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip().replace("**", "")

        if not line or line in ["-", "*"]:
            continue

        cleaned.append(line)

    return "\n".join(cleaned)


# ==========================================
# 🚀 REST ENDPOINTS
# ==========================================

@app.post("/detect")
async def detect_endpoint(file: UploadFile = File(...)):
    """
    Main detection endpoint:
    1. Detects injuries from image (CLIP)
    2. Computes vision-based severity
    3. Retrieves relevant medical knowledge (RAG)
    4. Generates LLM response with medical advice
    5. Creates structured questions based on injuries
    """
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 1. Vision detection
        detections = detect(image)
        labels = [d["label"] for d in detections]

        max_conf = max([d["confidence"] for d in detections])

        # 2. Low confidence gate
        if max_conf < 0.25:
            return {
                "injuries_detected": detections,
                "severity": "low",
                "rag_answer": """Condition: No clear injury detected
Risk: Low
Steps:
1. Improve lighting
2. Move camera closer
3. Retry scan
Red Flags:
- Bleeding
- Unconsciousness
""",
                "questions": [],
                "rag_sources": [],
                "low_confidence": True
            }

        # 3. Vision-based severity
        severity = compute_severity(detections)

        # 4. RAG retrieval
        query = f"""
Patient symptoms:
{", ".join(labels)}

What are the immediate first aid steps and risks?
"""

        rag_results = retrieve(query, index, chunks)
        context = "\n".join(rag_results[:3])[:1200] if rag_results else "General first aid"

        # 5. LLM call for medical advice
        prompt = f"""
Detected injuries:
{query}

Medical knowledge:
{context}

STRICT RULES:
- Do NOT assume severity without evidence
- If unclear → say uncertain

FORMAT:

Condition: ...
Risk: ...
Steps:
1. ...
2. ...
3. ...
Red Flags:
- ...
"""

        rag_answer = call_llm(prompt)
        rag_answer = clean_steps(rag_answer)

        # 6. Generate structured questions
        questions = generate_questions(detections)

        return {
            "injuries_detected": detections,
            "severity": severity,
            "rag_answer": rag_answer,
            "questions": questions,
            "rag_sources": rag_results[:2]
        }

    except Exception as e:
        print("❌ ERROR:", e)
        return {"error": str(e)}


@app.post("/refine")
async def refine_severity(data: dict = Body(...)):
    """
    Refine severity based on structured question answers.
    
    Input:
    {
      "answers": {
        "bleeding_severity": "severe",
        "consciousness": "yes",
        ...
      }
    }
    
    Output:
    {
      "severity": "critical|moderate|low",
      "score": numeric_confidence_score
    }
    
    NOTE: Does NOT use initial vision severity to avoid false escalation.
    Pure answer-based assessment.
    """
    answers = data.get("answers", {})

    # Compute severity from answers only
    severity, score = compute_answer_severity(answers)

    return {
        "severity": severity,
        "score": score
    }
