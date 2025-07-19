# emotion_model.py

import os
import requests
import json
import cv2
import tempfile
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = os.getenv('LUXAND_API_KEY')
LUXAND_URL = "https://api.luxand.cloud/photo/emotions"
HEADERS = {"token": API_TOKEN}

def emotions_from_frame(frame):
    """
    Takes a single video frame (numpy array), saves it temporarily, sends it to Luxand API,
    and returns the detected emotions.
    """
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=True) as temp_img:
        # Save frame as temporary image
        cv2.imwrite(temp_img.name, frame)
        
        with open(temp_img.name, "rb") as image_file:
            files = {"photo": image_file}
            response = requests.post(LUXAND_URL, headers=HEADERS, files=files)

        if response.status_code == 200:
            return response.json()  # Luxand response
        else:
            print("❌ Can't recognize people:", response.text)
            return None
