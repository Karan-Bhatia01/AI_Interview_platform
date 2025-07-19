from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from AudioAnalyser.services.audio_transcript import upload_to_assemblyai, transcribe_and_poll
from AudioAnalyser.services.evaluation import analyze_technical_answer
from VideoAnalyser.video_processing import process_video
from ReportGeneration.connection import generate_interview_report   # ✅ NEW IMPORT
import shared_state
from QuestionGeneration.context_generation import generate_interview_questions
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobInfo(BaseModel):
    candidate_name: str
    job_role: str
    company_name: str
    job_description: str
    other_details: Optional[str] = None

@app.post("/save-job-info")
async def save_job_info(job_info: JobInfo):
    shared_state.stored_job_info = job_info.dict()
    return {"message": "✅ Job details saved", "data": shared_state.stored_job_info}

@app.get("/get-job-info")
async def get_job_info():
    if shared_state.stored_job_info:
        return {"job_info": shared_state.stored_job_info}
    else:
        return {"message": "❌ No job info saved yet."}

@app.get("/generate-problems")
async def generate_problems_endpoint():
    details = shared_state.stored_job_info
    questions = generate_interview_questions(details)
    shared_state.questions_generated = questions
    return questions

@app.post("/upload")
async def upload_audio(audio: UploadFile = File(...)):
    try:
        audio_url = upload_to_assemblyai(audio.file)
        transcript_text = transcribe_and_poll(audio_url)
        analysis_result = analyze_technical_answer(transcript_text)

        # Generate timestamp key
        timestamp = datetime.utcnow().isoformat()

        # Save transcript & analysis under a new timestamp entry (no overwrite)
        shared_state.stored_audio_transcripts[timestamp] = {
            "transcription": transcript_text,
            "analysis": analysis_result
        }

        return {
            "timestamp": timestamp,
            "transcription": transcript_text,
            "analysis": analysis_result,
            "job_info_used": shared_state.stored_job_info
        }

    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze-video")
async def analyze_video(video: UploadFile = File(...)):
    try:
        video_bytes = await video.read()
        analysis_result = process_video(video_bytes)

        return {
            "message": "✅ Video processed successfully",
            "total_frames": analysis_result.get("total_frames"),
            "frames_analyzed": analysis_result.get("frames_analyzed"),
            "emotions": analysis_result.get("emotion_analysis"),
        }

    except Exception as e:
        return {"error": str(e)}

# ✅ NEW: Generate final report endpoint
@app.post("/generate-report")
async def generate_report():
    try:
        report = generate_interview_report()
        print(report)
        if report:
            return {"message": "✅ Report generated successfully", "report": report}
        else:
            return {"message": "❌ Failed to generate report"}
    except Exception as e:
        return {"error": str(e)}

