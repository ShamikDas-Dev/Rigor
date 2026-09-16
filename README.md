# RIGOR

### AI-Powered Real-Time Workout Posture & Rep Tracking

RIGOR is a browser-based fitness application that uses computer vision to analyze body movement through a webcam, count exercise repetitions, and provide real-time form feedback and voice guidance.

**Live:** https://rigor-fit.vercel.app

## Supported exercises

- Squat
- Push Up
- Plank
- Leg Raises
- Deadlift

## Features

- Real-time pose tracking with MediaPipe Pose
- Exercise-specific movement analyzers and rep state machines
- Live form feedback and voice feedback
- Workout dashboard and session summary
- Responsive desktop and mobile UI

## How it works

```text
Webcam
  ↓
MediaPipe Pose
  ↓
Body landmarks
  ↓
Exercise-specific analyzer
  ↓
Rep count + movement feedback
  ↓
On-screen + voice feedback
```

## Tech stack

- React
- Vite
- JavaScript
- CSS
- React Router
- MediaPipe Tasks Vision
- Lucide React
- Browser Speech Synthesis API

### Optional ML backend

- FastAPI
- PyTorch
- Torchvision
- Transformers
- Hugging Face: `prithivMLmods/Gym-Workout-Classifier-SigLIP2`

## Getting started

```bash
git clone https://github.com/ShamikDas-Dev/Rigor.git
cd Rigor
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Camera setup

For reliable tracking, keep the full body visible, use good lighting, and use a side or roughly 45° camera view for squats and deadlifts.

## Deployment

The production frontend is deployed on Vercel:

https://rigor-fit.vercel.app

For Vite on Vercel:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
```

For React Router history fallback, use a `vercel.json` rewrite to `/index.html` when direct refreshes such as `/workout` need to be supported.

## Architecture

RIGOR separates pose estimation, exercise analysis, and optional exercise recognition. MediaPipe supplies landmarks; each supported exercise has its own analyzer; the optional Hugging Face classifier is a recognition layer and is not treated as a form-quality judge.

## Limitations

- Form analysis is heuristic and depends on visible landmarks.
- Camera angle, lighting, distance, and occlusion can affect results.
- Deadlift posture feedback is a pose-geometry heuristic, not a direct spinal-curvature measurement.
- Speech synthesis behavior varies across browsers and devices.

## Repository structure

```text
Rigor/
├── public/
├── src/
│   ├── components/
│   ├── cv/
│   │   ├── analyzers/
│   │   └── geometry/
│   ├── hooks/
│   └── pages/
├── backend/
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

Do not commit `node_modules/`, `dist/`, `backend/.venv/`, `__pycache__/`, or `.env` files.

## Roadmap

- More exercises
- Better calibration and low-confidence handling
- Workout history and progress tracking
- PWA support
- More detailed analytics

## Author

**Shamik Das**

LinkedIn: https://www.linkedin.com/in/shamik-das-tech/

GitHub: https://github.com/ShamikDas-Dev

---

**RIGOR — Train With Precision.**
