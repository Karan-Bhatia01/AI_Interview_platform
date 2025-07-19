# query_generator.py

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class QueryGenerator:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate(self, short_prompt: str) -> str:
        prompt = f"""
You are assisting in an AI-powered interview analysis system.

The user has given a short or vague prompt:
"{short_prompt}"

Your task is to expand this into a highly detailed, structured query that can be used to retrieve meaningful and diverse information from an interview knowledge base. This knowledge base contains:
- Books, guides, and expert tips on behavioral interviews
- Technical round strategies and questions
- Preparation advice, dos and don’ts
- Common mistakes and recruiter feedback
- Communication, body language, and psychological readiness

The output query should:
- Be 5-6 sentences long
- Include specific keywords and concepts (like "behavioral expectations", "common technical pitfalls", "effective communication", "preparation strategies")
- Be written in a natural and information-seeking tone
- Aim to retrieve well-rounded and actionable content
- In points

Give only the expanded query without extra commentary.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ Error generating query: {e}")
            return ""
