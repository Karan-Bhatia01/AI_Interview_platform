import google.generativeai as genai
import os
from dotenv import load_dotenv
import chromadb # Import chromadb

# Load environment variables
load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env.")

# Configure the genai library with your API key
genai.configure(api_key=api_key)

def embedding_generation(chunks):
    """
    Generates embeddings for a list of text chunks.
    """
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=chunks  # Pass the list of chunks directly
        )
        return result['embedding']  # This will be a list of embeddings
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None

def store_embeddings_in_chromadb(embeddings, chunks, collection_name="my_document_embeddings", db_path="./chroma_db"):
    """
    Stores text chunks and their embeddings in a ChromaDB collection.

    Args:
        embeddings (list): A list of embedding vectors.
        chunks (list): A list of corresponding text chunks (strings).
        collection_name (str): The name of the ChromaDB collection.
        db_path (str): The path to store the ChromaDB data.
    """
    if not embeddings or not chunks:
        print("No embeddings or chunks to store.")
        return

    if len(embeddings) != len(chunks):
        raise ValueError("Number of embeddings must match the number of chunks.")

    try:
        # Initialize ChromaDB client
        client = chromadb.PersistentClient(path=db_path)

        # Get or create the collection
        collection = client.get_or_create_collection(name=collection_name)

        # Generate unique IDs for each chunk
        # In a real application, you might use a more robust ID generation
        ids = [f"chunk_{i}" for i in range(len(chunks))]

        # Add data to the collection
        collection.add(
            embeddings=embeddings,
            documents=chunks,
            ids=ids
        )
        print(f"Successfully stored {len(chunks)} chunks and embeddings in ChromaDB collection '{collection_name}'.")
        print(f"ChromaDB data stored at: {db_path}")

    except Exception as e:
        print(f"Error storing embeddings in ChromaDB: {e}")