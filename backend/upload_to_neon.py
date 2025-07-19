# upload_to_neon.py

import os
import psycopg2
from dotenv import load_dotenv
from langchain_chroma import Chroma

# Load environment variables from .env
load_dotenv()

# Step 1: Load ChromaDB
print("📦 Loading ChromaDB collection...")
chroma = Chroma(
    persist_directory="C:/Users/bhati/OneDrive/Desktop/AI_Interview_Project/backend/chroma_db",
    embedding_function=lambda x: x,  # dummy since we're not re-embedding
    collection_name="my_document_embeddings"
)

collection = chroma._collection

# Step 2: Extract data
results = collection.get(include=["documents", "embeddings", "metadatas"])
documents = results["documents"]
embeddings = results["embeddings"]
metadatas = results["metadatas"]

print(f"🧠 Loaded {len(documents)} documents from ChromaDB")

# Step 3: Connect to Neon PostgreSQL
print("🔌 Connecting to Neon PostgreSQL...")
try:
    conn = psycopg2.connect(
        dbname=os.getenv("PG_DB"),
        user=os.getenv("PG_USER"),
        password=os.getenv("PG_PASSWORD"),
        host=os.getenv("PG_HOST"),
        port=os.getenv("PG_PORT")
    )
    cursor = conn.cursor()
except Exception as e:
    print(f"❌ Failed to connect to PostgreSQL: {e}")
    exit(1)

# Step 4: Create table if not exists
cursor.execute("""
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS pdf_embeddings (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    embedding VECTOR,
    source TEXT,
    page INT
);
""")
conn.commit()

# Step 5: Insert documents
print("⬆️ Uploading embeddings to Neon...")
inserted = 0
for doc, emb, meta in zip(documents, embeddings, metadatas):
    try:
        source = meta.get("source", "unknown") if meta else "unknown"
        page = meta.get("page", None) if meta else None

        # Convert NumPy array to Python list
        if hasattr(emb, "tolist"):
            emb = emb.tolist()

        cursor.execute(
            "INSERT INTO pdf_embeddings (text, embedding, source, page) VALUES (%s, %s, %s, %s)",
            (doc, emb, source, page)
        )
        inserted += 1
    except Exception as e:
        print(f"⚠️ Skipped one entry due to error: {e}")
        continue


conn.commit()
cursor.close()
conn.close()

print(f"✅ Upload to Neon DB complete! Total uploaded: {inserted}")
