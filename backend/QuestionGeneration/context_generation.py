import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from ddgs import DDGS
import json
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env.")

genai.configure(api_key=api_key)

# Global variable to store last generated questions
last_questions_result = None

# Pydantic Schema
class QuestionSet(BaseModel):
    questions: List[str]
    summary: str

# System instruction for Gemini
system_instruction_text = (
    "You are an experienced technical interviewer. Based on the context provided, generate a list of potential interview questions "
    "that assess key skills, concepts, and problem-solving ability for the given role and company. The tone should be professional."
)

def generate_interview_questions(details: dict) -> dict:
    global last_questions_result

    # Extract necessary fields safely
    role = details.get('job_role') or details.get('role') or ''
    company = details.get('company_name') or details.get('company') or ''
    job_description = details.get('job_description', '')
    other_details = details.get('other_details', '')

    if not role or not company:
        last_questions_result = {"error": "Missing job role or company name."}
        return last_questions_result

    try:
        # Step 1: Search online using DDGS
        query = f"{role} interview questions at {company}"
        with DDGS() as ddgs:
            search_results_raw = ddgs.text(query, max_results=5)

        search_context = "\n".join([item.get('body', '') for item in search_results_raw if item.get('body')])
        if not search_context.strip():
            search_context = "No significant online information found. Use general knowledge."

        # Step 2: Prepare full prompt
        prompt = (
            f"Job Role: {role}\n"
            f"Company: {company}\n"
            f"Job Description: {job_description}\n"
            f"Additional Info: {other_details}\n\n"
            f"Background Info from web:\n{search_context}\n\n"
            f"Please generate 5 technical interview questions: 2 easy theory, 2 medium coding, 1 hard coding.\n"
            f"Also provide a short 2-3 sentence summary on the typical focus of interviews for this role.\n"
            f"Return strictly in this JSON format:\n"
            f'{{"questions": ["question1", "question2", ...], "summary": "summary text"}}'
        )

        # Step 3: Define expected schema
        simplified_json_schema = {
            "type": "object",
            "properties": {
                "questions": {"type": "array", "items": {"type": "string"}},
                "summary": {"type": "string"}
            },
            "required": ["questions", "summary"]
        }

        # Step 4: Gemini API call
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction_text
        )

        response = model.generate_content(
            contents=prompt,
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                response_schema=simplified_json_schema,
                temperature=0.5,
                top_p=0.9,
                max_output_tokens=2048,
            )
        )

        candidates = response.candidates
        if not candidates or not candidates[0].content.parts:
            finish_reason = candidates[0].finish_reason if candidates else 'No candidates'
            last_questions_result = {"error": f"No valid response. Finish reason: {finish_reason}"}
            return last_questions_result

        response_text = candidates[0].content.parts[0].text
        response_data = json.loads(response_text)
        validated = QuestionSet(**response_data)

        last_questions_result = validated.model_dump()
        return last_questions_result

    except json.JSONDecodeError as e:
        last_questions_result = {"error": f"Invalid JSON from Gemini: {str(e)}"}
        return last_questions_result
    except Exception as e:
        last_questions_result = {"error": str(e)}
        return last_questions_result
