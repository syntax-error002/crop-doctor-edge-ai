import os
import json
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Crop Doctor V6 Inference Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = r"c:\Users\shaswat\Downloads\New folder (15)\crop-doctor-mobile\assets\model\best_model.keras"
CLASS_PATH = r"c:\Users\shaswat\Downloads\New folder (15)\crop-doctor-mobile\assets\model\class_indices.json"

print("Loading Keras Model V6...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")

with open(CLASS_PATH, "r") as f:
    class_indices = json.load(f)

idx_to_class = {v: k for k, v in class_indices.items()}

@app.get("/")
def root():
    return {"status": "running", "classes": len(idx_to_class)}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image = image.resize((224, 224))
    
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)
    probs = predictions[0]
    best_idx = int(np.argmax(probs))
    best_class = idx_to_class.get(best_idx, "Unknown")
    confidence = float(probs[best_idx])
    
    print(f"Predicted: {best_class} ({confidence:.4f})")
    
    return {
        "diseaseId": best_class,
        "confidence": confidence
    }
