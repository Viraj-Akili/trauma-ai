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

# -------------------------------
# 🔐 LOAD ENV
# -------------------------------
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

print("🔑 KEY:", OPENROUTER_API_KEY[:10] if OPENROUTER_API_KEY else "NO KEY")

app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
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

# -------------------------------
# 🧠 LOAD CLIP
# -------------------------------
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# -------------------------------
# 📚 LOAD RAG
# -------------------------------
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

# -------------------------------
# 🏷️ LABELS
# -------------------------------
injury_labels = [
    "person with heavy bleeding from arm",
    "person with deep cut on leg bleeding",
    "person with bleeding head wound",
    "person with burn on hand",
    "person with severe burn with blisters",
    "person with broken arm unable to move",
    "person with broken leg unable to stand",
    "person with twisted ankle swelling",
    "person hit head and bleeding",
    "person choking holding throat",
    "person unable to breathe gasping",
    "person holding chest in pain",
    "person injured in road accident",
    "person unconscious not responding",
    "person fainted and collapsed",
]

# -------------------------------
# 🔍 CLIP DETECTION
# -------------------------------
def detect(image):
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

# -------------------------------
# ⚠️ SEVERITY
# -------------------------------
def compute_severity(detections):
    score = 0

    for d in detections:
        label = d["label"].lower()
        conf = d["confidence"]

        if "unconscious" in label or "not responding" in label:
            return "critical"

        if "choking" in label or "not breathing" in label:
            return "critical"

        if "heavy bleeding" in label:
            score += 8 * conf
        elif "bleeding" in label:
            score += 6 * conf
        elif "burn" in label:
            score += 5 * conf
        elif "broken" in label:
            score += 5 * conf
        else:
            score += 2 * conf

    if score >= 6:
        return "critical"
    elif score >= 3:
        return "moderate"
    else:
        return "low"

# -------------------------------
# 🤖 OPENROUTER
# -------------------------------
def call_llm(prompt):
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

        print("🔥 OPENROUTER:", res_json)

        if "choices" in res_json:
            return res_json["choices"][0]["message"]["content"]

        return "Condition: Uncertain\nRisk: Low\nSteps:\n1. Retry\nRed Flags:\n- Severe symptoms"

    except Exception as e:
        print("❌ LLM ERROR:", e)
        return "Condition: Error\nRisk: Unknown\nSteps:\n1. Retry\nRed Flags:\n- Severe symptoms"

# -------------------------------
# 🧹 CLEAN RESPONSE (FIX ** BUG)
# -------------------------------
def clean_steps(text):
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip().replace("**", "")

        if not line or line in ["-", "*"]:
            continue

        cleaned.append(line)

    return "\n".join(cleaned)

# -------------------------------
# 🚀 DETECT ENDPOINT
# -------------------------------
@app.post("/detect")
async def detect_endpoint(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        detections = detect(image)
        labels = [d["label"] for d in detections]

        max_conf = max([d["confidence"] for d in detections])

        # 🚫 CONFIDENCE GATE
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

        severity = compute_severity(detections)

        query = f"""
Patient symptoms:
{", ".join(labels)}

What are the immediate first aid steps and risks?
"""

        rag_results = retrieve(query, index, chunks)
        context = "\n".join(rag_results[:3])[:1200] if rag_results else "General first aid"

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

        # 🔥 DYNAMIC QUESTIONS
        questions = []

        if "bleeding" in query:
            questions += ["How severe is the bleeding?", "Is blood continuous or stopping?"]

        if "head" in query:
            questions += ["Is the person conscious?", "Any dizziness or vomiting?"]

        if "burn" in query:
            questions += ["What caused the burn?", "Are there blisters?"]

        if "broken" in query:
            questions += ["Can the person move the limb?", "Is there swelling?"]

        if not questions:
            questions = ["Is the person in pain?", "Is movement normal?"]

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

# -------------------------------
# 🔥 SEVERITY REFINEMENT
# -------------------------------
@app.post("/refine")
async def refine_severity(data: dict = Body(...)):
    answers = data.get("answers", {})
    current = data.get("severity", "low")

    score = 0

    if answers.get("bleeding") == "severe":
        score += 3
    if answers.get("conscious") == "no":
        score += 5
    if answers.get("breathing") == "no":
        score += 5
    if answers.get("pain") == "high":
        score += 2

    if current == "critical":
        score += 5
    elif current == "moderate":
        score += 3

    if score >= 7:
        return {"severity": "critical"}
    elif score >= 4:
        return {"severity": "moderate"}
    else:
        return {"severity": "low"}