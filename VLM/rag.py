from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from bs4 import BeautifulSoup
import re

# ==========================================
# 🧠 EMBEDDING MODEL
# Using mpnet for better semantic understanding
# ==========================================
embed_model = SentenceTransformer("all-mpnet-base-v2")

# ==========================================
# 📄 PDF LOADER
# ==========================================
def load_pdf(file_path):
    """Load and extract text from PDF files."""
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


# ==========================================
# 🌐 WEB CONTENT LOADER
# ==========================================
def load_html(url):
    """Fetch and clean HTML content from URL."""
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        # Remove scripts and styles
        for tag in soup(["script", "style"]):
            tag.decompose()

        return soup.get_text(separator=" ")

    except Exception as e:
        print(f"[RAG ERROR] URL failed: {url} → {e}")
        return ""


# ==========================================
# ✂️ IMPROVED TEXT CHUNKING
# Larger chunks for better context preservation
# ==========================================
def chunk_text(text, chunk_size=300, overlap=80):
    """
    Split text into chunks with overlap.
    Larger chunk_size (300) preserves more context.
    Overlap (80) maintains continuity between chunks.
    """
    sentences = re.split(r'(?<=[.!?]) +', text)

    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) < chunk_size:
            current += " " + sentence
        else:
            if current.strip():
                chunks.append(current.strip())
            overlap_text = current[-overlap:] if len(current) > overlap else current
            current = overlap_text + " " + sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks


# ==========================================
# 🧠 MEDICAL KNOWLEDGE FILTER
# Enhanced keyword detection for medical content
# ==========================================
def is_medical_chunk(text):
    """
    Filter chunks to only include medical/emergency relevant content.
    Uses keyword scoring to rank relevance.
    """
    # Core medical keywords
    medical_keywords = [
        "bleeding", "burn", "fracture", "injury", "wound",
        "first aid", "emergency", "unconscious", "breathing",
        "pain", "swelling", "treatment", "symptoms",
        "cpr", "shock", "bandage", "trauma",
        "airway", "respiration", "vomiting", "collapse",
        "injured", "CPR"
    ]

    # Emergency urgency keywords
    emergency_keywords = [
        "urgent", "critical", "immediate", "call", "danger",
        "911", "ambulance", "severe"
    ]

    text_lower = text.lower()
    score = 0

    # Count medical keyword matches
    for k in medical_keywords:
        if k in text_lower:
            score += 1

    # Emergency keywords worth more
    for k in emergency_keywords:
        if k in text_lower:
            score += 2

    # Stricter filter: need at least 3 keyword matches
    return score >= 3


# ==========================================
# 🔧 QUERY EXPANSION
# Robustly expand medical queries for better retrieval
# ==========================================
def expand_query(query):
    """
    Expand user query with medical domain terms.
    Helps RAG system find relevant chunks even with sparse queries.
    """
    # Core emergency medical terms
    expansion_terms = [
        "injury", "trauma", "first aid", "emergency",
        "bleeding", "treatment", "wound care",
        "CPR", "rescue", "medical", "health",
        "urgent", "critical", "ambulance"
    ]

    expanded = query + " " + " ".join(expansion_terms)
    return expanded


# ==========================================
# 🧠 BUILD FAISS INDEX
# Vectorize and index all medical knowledge
# ==========================================
def build_index(pdf_paths=None, urls=None):
    """
    Build FAISS index from PDF and web content.
    Returns (index, chunks) for retrieval.
    """
    pdf_paths = pdf_paths or []
    urls = urls or []

    all_chunks = []

    # Load and chunk PDFs
    for path in pdf_paths:
        text = load_pdf(path)
        if text:
            chunks = chunk_text(text, chunk_size=300, overlap=80)
            filtered = [c for c in chunks if is_medical_chunk(c)]
            all_chunks.extend(filtered)
            print(f"[RAG] Loaded {path}: {len(filtered)} relevant chunks")

    # Load and chunk web content
    for url in urls:
        text = load_html(url)
        if text:
            chunks = chunk_text(text, chunk_size=300, overlap=80)
            filtered = [c for c in chunks if is_medical_chunk(c)]
            all_chunks.extend(filtered)
            print(f"[RAG] Loaded {url}: {len(filtered)} relevant chunks")

    if not all_chunks:
        raise ValueError("No usable medical data found in PDFs or URLs")

    # Remove duplicates
    all_chunks = list(set(all_chunks))
    print(f"[RAG] Total unique medical chunks: {len(all_chunks)}")

    # Encode chunks into embeddings
    embeddings = embed_model.encode(all_chunks, normalize_embeddings=True)

    # Create FAISS index (Flat Inner Product for speed)
    dim = len(embeddings[0])
    index = faiss.IndexFlatIP(dim)
    index.add(np.array(embeddings))

    return index, all_chunks


# ==========================================
# 🔍 RETRIEVE & RERANK (main RAG pipeline)
# ==========================================
def retrieve(query, index, chunks, k=12, threshold=0.3):
    """
    Retrieve most relevant medical chunks using FAISS.
    
    Args:
        query: User question/symptoms
        index: FAISS index
        chunks: All chunked text
        k: Number of chunks to retrieve (default 12, up from 8)
        threshold: Minimum similarity score (0.3) to include result
    
    Returns:
        List of most relevant chunks, reranked by medical relevance
    """
    # Expand query with medical terms
    expanded = expand_query(query)

    # Encode expanded query
    query_vec = embed_model.encode([expanded], normalize_embeddings=True)

    # Retrieve top k neighbors
    D, I = index.search(query_vec, k)

    # Filter by similarity threshold and collect results
    results = []
    for dist, idx in zip(D[0], I[0]):
        # Only include results above threshold
        if dist >= threshold and idx < len(chunks):
            results.append({
                "chunk": chunks[idx],
                "similarity": float(dist)
            })

    if not results:
        return []

    # 🔥 RERANKING: Boost by medical keyword relevance
    medical_keywords = [
        "bleeding", "injury", "burn", "fracture", "emergency",
        "first aid", "cpr", "trauma", "wound", "treatment",
        "airway", "breathing", "unconscious", "shock"
    ]

    def rerank_score(item):
        text = item["chunk"].lower()
        # Base score is similarity
        score = item["similarity"]
        
        # Boost by medical keyword matches
        keyword_matches = sum(1 for kw in medical_keywords if kw in text)
        score += keyword_matches * 0.05
        
        return score

    # Sort by rerank score (descending)
    ranked = sorted(results, key=rerank_score, reverse=True)

    # Return top 5 chunks only (was top 5 before, keeping for backend efficiency)
    return [r["chunk"] for r in ranked[:5]]
