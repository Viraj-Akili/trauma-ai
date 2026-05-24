from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from bs4 import BeautifulSoup
import re

# -------------------------------
# 🔥 BETTER EMBEDDING MODEL
# -------------------------------
embed_model = SentenceTransformer("all-mpnet-base-v2")

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
# ✂️ BETTER CHUNKING
# -------------------------------
def chunk_text(text, chunk_size=120, overlap=40):
    sentences = re.split(r'(?<=[.!?]) +', text)

    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) < chunk_size:
            current += " " + sentence
        else:
            chunks.append(current.strip())
            overlap_text = current[-overlap:]
            current = overlap_text + " " + sentence

    if current:
        chunks.append(current.strip())

    return chunks

# -------------------------------
# 🧠 STRONGER FILTER
# -------------------------------
def is_medical_chunk(text):
    medical_keywords = [
        "bleeding", "burn", "fracture", "injury", "wound",
        "first aid", "emergency", "unconscious", "breathing",
        "pain", "swelling", "treatment", "symptoms",
        "cpr", "shock", "bandage", "trauma"
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

    return score >= 3   # 🔥 stricter filter

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

    # remove duplicates
    all_chunks = list(set(all_chunks))

    print(f"[RAG] Clean chunks: {len(all_chunks)}")

    embeddings = embed_model.encode(all_chunks, normalize_embeddings=True)

    dim = len(embeddings[0])
    index = faiss.IndexFlatIP(dim)
    index.add(np.array(embeddings))

    return index, all_chunks

# -------------------------------
# 🔍 RETRIEVE + RERANK
# -------------------------------
def retrieve(query, index, chunks, k=8):

    # 🔥 QUERY EXPANSION
    expanded_query = query + " injury trauma first aid emergency bleeding treatment"

    query_vec = embed_model.encode([expanded_query], normalize_embeddings=True)
    D, I = index.search(query_vec, k)

    results = []
    for i in I[0]:
        if i < len(chunks):
            results.append(chunks[i])

    # 🔥 RERANKING (KEY IMPROVEMENT)
    keywords = ["bleeding", "injury", "burn", "fracture", "emergency"]

    ranked = sorted(
        results,
        key=lambda x: sum(kw in x.lower() for kw in keywords),
        reverse=True
    )

    return ranked[:5]