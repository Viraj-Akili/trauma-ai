from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import io
from pydantic import BaseModel
from typing import Dict

from rag import build_index, retrieve

app = FastAPI()

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
def compute_severity(injuries, posture, confidences):

    score = 0

    text = " ".join(injuries).lower()

    # 🚨 HARD OVERRIDES
    if "unconscious" in text or "not moving" in posture:
        return "critical"

    if "choking" in text or "not breathing" in text:
        return "critical"

    for inj, conf in zip(injuries, confidences):

        if "heavy bleeding" in inj:
            score += 10 * conf

        elif "head injury" in inj:
            score += 8 * conf

        elif "chest pain" in inj:
            score += 9 * conf

        elif "broken" in inj:
            score += 6 * conf

        elif "burn" in inj:
            score += 5 * conf

    if "lying" in posture:
        score += 3

    if score >= 9:
        return "critical"
    elif score >= 5:
        return "moderate"
    else:
        return "low"

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
def generate_questions(injuries, posture):
    return [
        {"key": "conscious", "question": "Is the person conscious?"},
        {"key": "breathing", "question": "Is the person breathing?"},
        {"key": "heavy_bleeding", "question": "Is there heavy bleeding?"}
    ]

# -------------------------------
# 🔥 REFINE LOGIC
# -------------------------------
class RefineRequest(BaseModel):
    injuries: list
    posture: str
    severity: str
    answers: Dict[str, str]

def refine_assessment(injuries, posture, severity, answers):

    if answers.get("breathing") == "no":
        return "critical", "Patient not breathing"

    if answers.get("conscious") == "no":
        return "critical", "Loss of consciousness"

    if answers.get("heavy_bleeding") == "yes":
        return "critical", "Severe bleeding"

    return severity, "Stable but needs monitoring"

# -------------------------------
# 🔥 DETECT ENDPOINT
# -------------------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    injury_results = detect_multi(image, injury_labels)
    injury_results = [i for i in injury_results if i["confidence"] > 0.4]
    if not injury_results:
        return {
            "error": "Low confidence detection. Please upload clearer image."
        }

    posture = detect_multi(image, posture_labels, 0.3, 1)[0]["label"]

    injury_names = [i["label"] for i in injury_results]
    confidences = [i["confidence"] for i in injury_results]

    severity = compute_severity(injury_names, posture, confidences)

    query = " ".join(injury_names)
    retrieved = retrieve(query, index, chunks) if index else []

    first_aid = format_first_aid(retrieved, injury_names, posture, severity)
    questions = generate_questions(injury_names, posture)

    return {
        "posture": posture,
        "injuries_detected": injury_results,
        "severity": severity,
        "first_aid": first_aid,
        "questions": questions
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