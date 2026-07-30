import os
import shutil
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import subprocess
import json

# Kaggle input is READ-ONLY. We must copy data to /kaggle/working/ first.
KAGGLE_INPUT = "/kaggle/input"
WORKING_DIR = "/kaggle/working"

def find_class_directory(root_path):
    """Recursively find the directory that contains class sub-folders with images."""
    best_dir = root_path
    max_classes = 0
    for root, dirs, files in os.walk(root_path):
        if len(dirs) > 1:
            # Check if subdirs contain images (i.e. these are class folders)
            image_class_count = 0
            for d in dirs:
                subdir = os.path.join(root, d)
                sample_files = os.listdir(subdir)[:10]
                if any(f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')) for f in sample_files):
                    image_class_count += 1
            if image_class_count > max_classes:
                max_classes = image_class_count
                best_dir = root
    return best_dir, max_classes

def clean_corrupt_images(directory):
    """Remove corrupt images from a WRITABLE directory."""
    corrupt_count = 0
    total = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                total += 1
                file_path = os.path.join(root, file)
                try:
                    raw = tf.io.read_file(file_path)
                    tf.io.decode_image(raw, expand_animations=False)
                except Exception:
                    print(f"  Removing corrupt: {file_path}")
                    os.remove(file_path)
                    corrupt_count += 1
    print(f"Scanned {total} images. Removed {corrupt_count} corrupt files.")
    return corrupt_count

def build_model(num_classes):
    base_model = EfficientNetV2B0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False

    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.2),
        tf.keras.layers.RandomContrast(0.2),
    ], name="data_augmentation")

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = data_augmentation(inputs)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.4)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=inputs, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model, base_model

def main():
    # Step 1: Find the dataset inside the read-only input
    print("Step 1: Locating dataset in /kaggle/input...")
    print("Input contents:", os.listdir(KAGGLE_INPUT))
    
    source_dir, num_classes = find_class_directory(KAGGLE_INPUT)
    print(f"Found class directory: {source_dir} with {num_classes} classes")
    print(f"Classes: {sorted(os.listdir(source_dir))}")

    if num_classes <= 1:
        print("ERROR: Could not find class directories. Aborting.")
        return

    # Step 2: Copy dataset to writable /kaggle/working/train_data
    dest_dir = os.path.join(WORKING_DIR, "train_data")
    print(f"\nStep 2: Copying dataset to writable location: {dest_dir} ...")
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    shutil.copytree(source_dir, dest_dir)
    print("Copy complete.")

    # Step 3: Clean corrupt images from the writable copy
    print("\nStep 3: Cleaning corrupt images...")
    clean_corrupt_images(dest_dir)

    # Step 4: Remove any empty class folders after cleaning
    for d in os.listdir(dest_dir):
        class_path = os.path.join(dest_dir, d)
        if os.path.isdir(class_path) and len(os.listdir(class_path)) == 0:
            print(f"  Removing empty class folder: {d}")
            os.rmdir(class_path)

    BATCH_SIZE = 32
    IMG_SIZE = (224, 224)

    # Step 5: Load datasets
    print("\nStep 4: Loading datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dest_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dest_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"Training with {num_classes} classes: {class_names}")

    # Save class mapping
    class_indices = {name: idx for idx, name in enumerate(class_names)}
    with open('class_indices.json', 'w') as f:
        json.dump(class_indices, f)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model, base_model = build_model(num_classes)

    # Phase 1: Train classification head
    print("\n--- Phase 1: Training Classification Head ---")
    checkpoint = ModelCheckpoint('best_model.keras', monitor='val_accuracy', save_best_only=True)
    early_stop = EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True)

    model.fit(
        train_ds,
        epochs=15,
        validation_data=val_ds,
        callbacks=[checkpoint, early_stop]
    )

    # Phase 2: Fine-tune base model
    print("\n--- Phase 2: Fine-Tuning Base Model ---")
    base_model.trainable = True
    for layer in base_model.layers[:-50]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    reduce_lr = ReduceLROnPlateau(monitor='val_accuracy', factor=0.2, patience=3, min_lr=1e-7)

    model.fit(
        train_ds,
        epochs=20,
        validation_data=val_ds,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )

    print("\nTraining Complete!")

    # CRITICAL: Delete the copied training data so Kaggle output only contains model files
    print("Cleaning up copied training data from /kaggle/working/...")
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
        print("Training data cleaned up.")

    # Convert to TFJS
    print("Converting to TensorFlow.js format...")
    try:
        subprocess.run(["pip", "install", "tensorflowjs"], check=True)
        subprocess.run(["tensorflowjs_converter", "--input_format=keras", "best_model.keras", "tfjs_model"], check=True)
        print("TFJS conversion successful!")
    except Exception as e:
        print(f"TFJS conversion failed: {e}")

if __name__ == '__main__':
    main()
