from __future__ import annotations

import io
from functools import lru_cache

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_ID = "prithivMLmods/Gym-Workout-Classifier-SigLIP2"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI(title="RIGOR Exercise Classifier", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_model():
    print(f"Loading {MODEL_ID} on {DEVICE}...")

    processor = AutoImageProcessor.from_pretrained(MODEL_ID)
    model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
    model.to(DEVICE)
    model.eval()

    print("Model loaded.")
    return processor, model


def normalize_label(label: str) -> str:
    return " ".join(label.replace("_", " ").replace("-", " ").split()).lower()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "device": str(DEVICE),
    }


@app.post("/predict-exercise")
async def predict_exercise(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to read the uploaded image.") from exc

    processor, model = load_model()

    inputs = processor(images=image, return_tensors="pt")
    inputs = {key: value.to(DEVICE) for key, value in inputs.items()}

    with torch.inference_mode():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)[0]
        top_probabilities, top_indices = torch.topk(probabilities, k=min(3, probabilities.shape[-1]))

    labels = []
    for probability, index in zip(top_probabilities.tolist(), top_indices.tolist()):
        label = model.config.id2label.get(index, str(index))
        labels.append(
            {
                "exercise": normalize_label(label),
                "confidence": round(float(probability), 4),
            }
        )

    return {
        "exercise": labels[0]["exercise"],
        "confidence": labels[0]["confidence"],
        "top_predictions": labels,
    }
