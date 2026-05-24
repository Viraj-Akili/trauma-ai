# 🚑 Trauma AI

AI-powered emergency trauma triage and injury assessment platform built using **FastAPI**, **React/Vite**, **Computer Vision**, and **LLM-assisted medical reasoning**.

## 🌟 Overview

Trauma AI helps analyze visible injuries from uploaded images or live camera input and provides:

* Injury detection
* Severity estimation
* Emergency response guidance
* Follow-up assessment questions
* AI-assisted trauma refinement workflow

The system is designed as a rapid-response prototype for emergency triage assistance and medical AI experimentation.

---

# 🖼️ Features

## 📷 Vision-Based Trauma Detection

* Analyze uploaded trauma/injury images
* Camera integration for live capture
* Multi-injury recognition pipeline
* Confidence-based predictions

## 🧠 AI Severity Engine

* Dynamic severity refinement
* Question-driven escalation system
* Context-aware emergency assessment
* Critical injury prioritization

## 🏥 Emergency Guidance

* Immediate response instructions
* Emergency hotline integration
* Severity color coding
* Structured triage workflow

## ⚡ Modern Full Stack Architecture

### Frontend

* React + Vite
* Responsive UI
* Real-time assessment flow
* Camera support

### Backend

* FastAPI
* Modular RAG pipeline
* OpenRouter LLM integration
* Secure environment variable handling

---

# 🛠️ Tech Stack

| Category         | Technologies                  |
| ---------------- | ----------------------------- |
| Frontend         | React, Vite, JavaScript       |
| Backend          | FastAPI, Python               |
| AI / ML          | CLIP, OpenRouter, RAG         |
| Styling          | Custom CSS                    |
| Deployment Ready | GitHub, Environment Variables |

---

# 📂 Project Structure

```bash
trauma-ai/
│
├── VLM/
│   ├── data/
│   ├── main.py
│   ├── rag.py
│   ├── .env.example
│   └── .gitignore
│
├── TraumaTriage.jsx
├── index.html
├── main.jsx
├── vite.config.js
├── package.json
└── README.md
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Viraj-Akili/trauma-ai.git
cd trauma-ai
```

---

## 2️⃣ Backend Setup

```bash
cd VLM
pip install -r requirements.txt
```

Create a local `.env` file inside `VLM/`:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

```bash
http://127.0.0.1:8000
```

---

## 3️⃣ Frontend Setup

Open another terminal:

```bash
npm install
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

# 🔒 Security

This repository does **NOT** include real API keys.

Environment variables are excluded using `.gitignore`.

Use `.env.example` as a template.

---

# 🧠 How It Works

## Step 1 — Injury Detection

User uploads an image or captures one using the camera.

## Step 2 — AI Analysis

Backend analyzes visible trauma using computer vision and retrieval-based reasoning.

## Step 3 — Severity Classification

System predicts severity level:

* Low
* Moderate
* Severe
* Critical

## Step 4 — Follow-Up Questions

Dynamic questions improve severity estimation accuracy.

## Step 5 — Emergency Guidance

User receives structured emergency response instructions.

---

# 📸 Example Workflow

1. Upload trauma image
2. AI identifies injury region
3. Severity initially predicted
4. User answers follow-up questions
5. Severity refined dynamically
6. Emergency instructions generated

---

# ⚠️ Disclaimer

This project is an educational and experimental AI system.

It is **NOT** a replacement for professional medical diagnosis or emergency services.

Always contact certified medical professionals during real emergencies.

---

# 💡 Future Improvements

* Voice-based emergency assistant
* Real-time ambulance routing
* Medical history integration
* Multi-language support
* Mobile application
* Hospital recommendation engine
* Advanced medical segmentation models

---

# 👨‍💻 Author

## Viraj Akili

B.Tech Student • AI Enthusiast • Full Stack Developer

GitHub:
[https://github.com/Viraj-Akili](https://github.com/Viraj-Akili)

---

# ⭐ Support

If you found this project interesting, consider:

* Starring the repository ⭐
* Sharing feedback
* Contributing improvements

---

# 🔥 Project Status

✅ Frontend Complete
✅ Backend Integrated
✅ Secure API Handling
✅ AI Severity Refinement
✅ GitHub Public Release Ready
