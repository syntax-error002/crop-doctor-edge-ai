import tensorflow as tf
import json
import os
import struct
import numpy as np

# Load the trained model
MODEL_PATH = r"c:\Users\shaswat\Downloads\New folder (15)\crop-doctor-mobile\assets\model\best_model.keras"
OUTPUT_DIR = r"c:\Users\shaswat\Downloads\New folder (15)\crop-doctor\public\model\tfjs_model"

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
model.summary()

# Try the tfjs python API directly (bypasses the broken CLI)
try:
    import tensorflowjs as tfjs
    print("Converting with tensorflowjs Python API...")
    tfjs.converters.save_keras_model(model, OUTPUT_DIR)
    print("SUCCESS: Model converted to TFJS format!")
except Exception as e:
    print(f"TFJS API failed: {e}")
    print("Falling back to SavedModel export...")
    saved_model_dir = os.path.join(os.path.dirname(OUTPUT_DIR), "saved_model_temp")
    model.export(saved_model_dir)
    print(f"SavedModel exported to {saved_model_dir}")
    print("You can convert this with: tensorflowjs_converter --input_format=tf_saved_model")
