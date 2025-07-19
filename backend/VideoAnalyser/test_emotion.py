import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Load the trained model once
model = load_model(r'VideoAnalyser\facialemotionmodel.h5')

# Define the emotion labels corresponding to the model's output classes
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Anxious', 'Surprise', 'Neutral', 'Confident']

def preprocess_frame(frame, target_size=(48, 48)):
    """
    Preprocess a video frame:
    - Convert to grayscale
    - Resize to target size
    - Normalize pixel values
    - Reshape for model input
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, target_size)
    normalized = resized / 255.0
    reshaped = np.reshape(normalized, (1, target_size[0], target_size[1], 1))
    return reshaped

def predict_emotion(frame):
    """
    Predict emotion for a given frame.

    Returns:
        emotion_label (str): The predicted emotion name
        confidence (float): The confidence score between 0 and 1
    """
    processed = preprocess_frame(frame)
    predictions = model.predict(processed, verbose=0)[0]
    top_index = np.argmax(predictions)
    emotion_label = EMOTIONS[top_index]
    confidence = float(predictions[top_index])
    return emotion_label, confidence
