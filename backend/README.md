# RIGOR Hugging Face Exercise Classifier

Local FastAPI service for `prithivMLmods/Gym-Workout-Classifier-SigLIP2`.

## Windows setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Run

```powershell
uvicorn app:app --reload --host 127.0.0.1 --port 8001
```

First model inference downloads the Hugging Face model and caches it locally.

## Test

Open:

- http://127.0.0.1:8001/health

Interactive API:

- http://127.0.0.1:8001/docs

POST an image to `/predict-exercise`.
