# 🧠 AI Interview Platform

The **AI Interview Platform** is an end-to-end mock interview system powered by Artificial Intelligence. It simulates realistic technical and behavioral interviews using job descriptions, webcam-based emotion detection, audio transcription, and dynamic feedback generation.

This project is ideal for students, professionals, and job seekers looking to practice interviews with AI-based feedback.

---

## 📸 Key Features

- 🔎 **Job-Aware Question Generation**  
  Upload your job description to generate custom interview questions (technical + behavioral).

- 🎤 **Audio-Based Responses**  
  Answer questions by recording your voice — stored and transcribed with timestamps.

- 🎥 **Emotion Detection via Webcam**  
  Real-time facial expression analysis using a trained Keras deep learning model.

- 🧾 **Dynamic Report Generation**  
  Feedback on communication, emotional expression, and technical depth based on your session.

- 💡 **Modular Design**  
  Easily extend or update components like the question generator, embedding logic, or analysis engine.

---

## 🧱 Tech Stack

| Layer          | Technology                     |
|----------------|---------------------------------|
| Backend        | FastAPI, Python                 |
| Frontend       | HTML, CSS, JavaScript           |
| ML/NLP         | OpenAI Embeddings, TensorFlow   |
| Database       | ChromaDB (local), Neon PostgreSQL (pgvector) |
| Emotion Model  | Keras (pretrained model)        |
| PDF Parsing    | PyMuPDF                         |


---

## ⚙️ How It Works

1. **User Uploads Job Description**
   - The text is extracted and split into chunks.
   - Embeddings are generated using OpenAI and stored in ChromaDB and Neon PostgreSQL.

2. **Interview Begins**
   - Frontend loads 5 generated questions as clickable blocks.
   - Each click opens the webcam and allows audio recording.

3. **Audio + Emotion Analysis**
   - Audio is transcribed using Whisper/OpenAI API.
   - Webcam stream is passed through a Keras model for emotion detection.

4. **Report Generation**
   - Feedback is compiled from transcript analysis + emotion data.
   - The system generates a structured feedback report (behavioral, communication, technical).

---

## 🚀 Setup Instructions

### 🔧 Backend Setup

Clone the repo:
   ```bash
   git clone https://github.com/Karan-Bhatia01/AI_Interview_platform.git
   cd AI_Interview_platform
