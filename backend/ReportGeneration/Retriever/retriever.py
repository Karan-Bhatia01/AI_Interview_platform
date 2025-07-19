# retriever.py

import os
import numpy as np
import psycopg2
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class ContextRetriever:
    def __init__(self):
        self.db_params = {
            "dbname": os.getenv("PG_DB"),
            "user": os.getenv("PG_USER"),
            "password": os.getenv("PG_PASSWORD"),
            "host": os.getenv("PG_HOST"),
            "port": os.getenv("PG_PORT")
        }

    def _get_embedding(self, query: str):
        try:
            response = genai.embed_content(
                model="models/embedding-001",
                content=query,
                task_type="retrieval_query"
            )
            return response["embedding"]
        except Exception as e:
            print(f"❌ Error generating embedding: {e}")
            return None

    def _connect_db(self):
        try:
            return psycopg2.connect(**self.db_params)
        except Exception as e:
            print(f"❌ Error connecting to Neon DB: {e}")
            return None

    def retrieve(self, query: str, top_k: int = 5):
        query_vector = self._get_embedding(query)
        if not query_vector:
            return []

        conn = self._connect_db()
        if not conn:
            return []

        try:
            cursor = conn.cursor()

            vector_str = "[" + ", ".join(f"{x:.6f}" for x in query_vector) + "]"

            cursor.execute("""
                SELECT id, text, source, page
                FROM pdf_embeddings
                ORDER BY embedding <-> %s::vector
                LIMIT %s;
            """, (vector_str, top_k))

            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            return [
                {
                    "id": row[0],
                    "text": row[1],
                    "source": row[2],
                    "page": row[3]
                } for row in rows
            ]
        except Exception as e:
            print(f"❌ Error retrieving data: {e}")
            return []
