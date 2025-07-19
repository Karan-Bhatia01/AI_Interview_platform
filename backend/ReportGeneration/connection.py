import os
import json
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from dotenv import load_dotenv

from ReportGeneration.Retriever.retriever import ContextRetriever
from ReportGeneration.Query.query_generation import QueryGenerator
from shared_state import stored_job_info, stored_audio_transcripts, stored_video_analysis, questions_generated

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- JSON Schema ---
simplified_json_schema = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "technical_feedback": {"type": "string"},
        "behavioral_feedback": {"type": "string"},
        "communication_feedback": {"type": "string"},
        "suggestions": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["summary", "technical_feedback", "behavioral_feedback", "communication_feedback", "suggestions"]
}

# --- System Instruction ---
system_instruction_text = """
You are an expert interview analyst AI. You will generate a detailed, structured report in JSON format using:
- Retrieved knowledge base context (interview tips, technical round strategies, behavioral techniques)
- User's job information
- Questions asked in the interview
- Audio transcript from the interview
- Video-based emotional and behavioral analysis

Use all the above data to create:
- A general summary
- Technical round feedback
- Behavioral round feedback
- Communication/body language feedback
- Actionable improvement suggestions (5 max)

Return response in strict JSON only. Use plain, professional language.
"""

# --- Main Function ---
def generate_interview_report():
    try:
        # Generate Query
        query_gen = QueryGenerator()
        expanded_query = query_gen.generate("Give me the best interview tips, tricks, feedbacks")

        # Retrieve context
        retriever = ContextRetriever()
        context_chunks = retriever.retrieve(expanded_query)

        # Format context
        formatted_chunks = "\n\n".join(
            [f"Source: {chunk['source']} | Page: {chunk['page']}\n{chunk['text']}" for chunk in context_chunks]
        )

        # Compose full prompt
        prompt = f"""
=== Retrieved Context ===
{formatted_chunks}

=== Job Info ===
{stored_job_info}

=== Questions Asked ===
{questions_generated}

=== Audio Transcript ===
{stored_audio_transcripts}

=== Video Emotion Analysis ===
{stored_video_analysis}
"""

        # Gemini call
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

        # Parse and return JSON result
        return json.loads(response.text.strip())

    except Exception as e:
        print(f"❌ Error generating interview report: {e}")
        return None
