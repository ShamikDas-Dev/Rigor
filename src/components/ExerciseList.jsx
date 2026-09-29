import React from "react";
import { ArrowUpRight } from "lucide-react";
import "./ExerciseList.css";

const exercises = [
  {
    id: "01",
    name: "SQUAT",
    description: "Lower. Hold. Drive.",
    analysis: "KNEE ANALYSIS",
  },
  {
    id: "02",
    name: "PUSH UP",
    description: "Control every repetition.",
    analysis: "ELBOW ANALYSIS",
  },
  {
    id: "03",
    name: "PLANK",
    description: "Hold your position.",
    analysis: "BODY ANALYSIS",
  },
  {
    id: "04",
    name: "LEG RAISES",
    description: "Move with control.",
    analysis: "HIP ANALYSIS",
  },
  {
    id: "05",
    name: "DEADLIFT",
    description: "Hinge. Lift. Control.",
    analysis: "HIP ANALYSIS",
  },
  {
    id: "06",
    name: "BICEP CURL",
    description: "Curl with control.",
    analysis: "ELBOW ANALYSIS",
  },
  {
    id: "07",
    name: "SHOULDER PRESS",
    description: "Press with stability.",
    analysis: "ELBOW ANALYSIS",
  },
  {
    id: "08",
    name: "LATERAL RAISES",
    description: "Raise to shoulder height.",
    analysis: "ARM ANALYSIS",
  },
];

export default function ExerciseList() {
  return (
    <div className="exercise-list">
      {exercises.map((exercise) => (
        <div className="exercise-row" key={exercise.id}>

          <div className="exercise-number">
            {exercise.id}
          </div>

          <div className="exercise-main">
            <h3>{exercise.name}</h3>
            <p>{exercise.description}</p>
          </div>

          <div className="exercise-analysis">
            {exercise.analysis}
          </div>

          <div className="exercise-arrow">
            <ArrowUpRight size={17} strokeWidth={1.5} />
          </div>

        </div>
      ))}
    </div>
  );
}