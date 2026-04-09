from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

try:
    r = model.generate_content("say hello")
    print("✅ GEMINI WORKS:", r.text)
except Exception as e:
    print("❌ GEMINI ERROR:", str(e))