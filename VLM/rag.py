from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from bs4 import BeautifulSoup

# -------------------------------
# 🔥 LOAD MODEL
# -------------------------------
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------------
# 📄 LOAD PDF
# -------------------------------
def load_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""

        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        return text

    except Exception as e:
        print(f"[RAG ERROR] PDF failed: {file_path} → {e}")
        return ""

# -------------------------------
# 🌐 LOAD HTML
# -------------------------------
def load_html(url):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style"]):
            tag.decompose()

        return soup.get_text(separator=" ")

    except Exception as e:
        print(f"[RAG ERROR] URL failed: {url} → {e}")
        return ""

# -------------------------------
# ✂️ CHUNK TEXT
# -------------------------------
import re

def chunk_text(text, chunk_size=300, overlap=50):
    sentences = re.split(r'(?<=[.!?]) +', text)

    chunks = []
    current = ""

    for sentence in sentences:
        # If adding sentence stays within limit
        if len(current) + len(sentence) < chunk_size:
            current += " " + sentence
        else:
            chunks.append(current.strip())
            
            # 🔥 Add overlap from previous chunk
            overlap_text = current[-overlap:]
            current = overlap_text + " " + sentence

    if current:
        chunks.append(current.strip())

    return chunks

# -------------------------------
# 🧠 MEDICAL FILTER (NEW 🔥)
# -------------------------------
def is_medical_chunk(text):

    medical_keywords = [
        "bleeding", "burn", "fracture", "injury", "wound",
        "first aid", "emergency", "unconscious", "breathing",
        "pain", "swelling", "treatment", "symptoms",
        "CPR", "shock", "bandage", "trauma"
    ]

    emergency_keywords = [
        "urgent", "critical", "immediate", "call", "danger"
    ]

    text = text.lower()

    score = 0

    for k in medical_keywords:
        if k in text:
            score += 1

    for k in emergency_keywords:
        if k in text:
            score += 2

    return score >= 2

# -------------------------------
# 🧠 BUILD INDEX
# -------------------------------
def build_index(pdf_paths=None, urls=None):

    pdf_paths = pdf_paths or []
    urls = urls or []

    all_chunks = []

    for path in pdf_paths:
        text = load_pdf(path)
        chunks = chunk_text(text)

        filtered = [c for c in chunks if is_medical_chunk(c)]
        all_chunks.extend(filtered)

    for url in urls:
        text = load_html(url)
        chunks = chunk_text(text)

        filtered = [c for c in chunks if is_medical_chunk(c)]
        all_chunks.extend(filtered)

    if not all_chunks:
        raise ValueError("No usable medical data found")

    # Remove duplicates
    all_chunks = list(set(all_chunks))

    print(f"[RAG] Clean medical chunks: {len(all_chunks)}")

    embeddings = embed_model.encode(all_chunks, normalize_embeddings=True)

    dim = len(embeddings[0])
    index = faiss.IndexFlatIP(dim)
    index.add(np.array(embeddings))

    return index, all_chunks

# -------------------------------
# 🔍 RETRIEVE
# -------------------------------
def retrieve(query, index, chunks, k=8):

    query_vec = embed_model.encode([query], normalize_embeddings=True)
    D, I = index.search(query_vec, k)

    results = []
    for i in I[0]:
        if i < len(chunks):
            chunk = chunks[i]
            results.append(chunk)

    return results