import google.generativeai as genai
from google.generativeai.types import GenerationConfig
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

# Define global variable to store last result
last_analysis_result = None  # ✅ Accessible from other files

# Define Pydantic Schemas for Technical Evaluation
class TechnicalEvaluation(BaseModel):
    category: str
    score: float
    feedback: str
    improvement_tip: str

class TechnicalFeedback(BaseModel):
    evaluation: List[TechnicalEvaluation]
    overall_summary: str
    actionable_suggestions: List[str]

# Define system instruction
system_instruction_text = (
    "You are a highly skilled technical interviewer. Your job is to evaluate the following technical answer "
    "in terms of correctness, clarity, depth of explanation, and conciseness. "
    "Provide feedback in a positive, constructive tone along with suggestions for improvement. "
    "Your response must follow the provided JSON schema exactly."
)

def analyze_technical_answer(transcript_text: str) -> dict:
    global last_analysis_result  # ✅ Ensure updates to the global variable

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction_text
        )

        main_content_prompt = (
            f"Please evaluate the following technical answer. Analyze it for correctness, clarity, depth, and conciseness. "
            f"Provide the results in JSON format as per the schema.\n\n"
            f"Technical Answer:\n{transcript_text}"
        )

        simplified_json_schema = {
            "type": "object",
            "properties": {
                "evaluation": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string"},
                            "score": {"type": "number"},
                            "feedback": {"type": "string"},
                            "improvement_tip": {"type": "string"}
                        },
                        "required": ["category", "score", "feedback", "improvement_tip"]
                    }
                },
                "overall_summary": {"type": "string"},
                "actionable_suggestions": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["evaluation", "overall_summary", "actionable_suggestions"]
        }

        response = model.generate_content(
            contents=main_content_prompt,
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
            print(f"❌ No valid response. Finish reason: {finish_reason}")
            last_analysis_result = {"error": f"No valid response. Finish reason: {finish_reason}"}
            return last_analysis_result

        response_text = candidates[0].content.parts[0].text
        response_data = json.loads(response_text)
        feedback = TechnicalFeedback(**response_data)
        last_analysis_result = feedback.model_dump()  # ✅ Save result globally
        return last_analysis_result

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parsing Error: {e}")
        last_analysis_result = {"error": "Invalid JSON from Gemini."}
        return last_analysis_result

    except Exception as e:
        print(f"❌ General Error: {e}")
        last_analysis_result = {"error": str(e)}
        return last_analysis_result

