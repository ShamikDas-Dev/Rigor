import React, {
  useCallback,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useWorkout } from "../hooks/useWorkout";

import CameraView from "../components/CameraView";
import AnalysisPanel from "../components/AnalysisPanel";
import SessionSummary from "../components/SessionSummary";
import Button from "../components/Button";

import "./Workout.css";

export default function Workout() {
  const [landmarks, setLandmarks] =
    useState(null);

  const {
    exercise,
    isPaused,
    isComplete,
    time,
    analysis,
    togglePause,
    endSession,
    changeExercise,
    resetSession,
  } = useWorkout(
    "Squat",
    landmarks
  );

  const handleLandmarks =
    useCallback(
      (nextLandmarks) => {
        setLandmarks(
          nextLandmarks
        );
      },
      []
    );

  return (
    <div className="workout-page">
      <header className="workout-topbar">
        <Link
          to="/"
          className="topbar-logo"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
          <span>RIGOR</span>
        </Link>

        <div className="topbar-actions">
          <Button
            variant="danger"
            size="sm"
            onClick={endSession}
          >
            END SESSION
          </Button>
        </div>
      </header>

      <main className="workout-main container">
        <div className="workout-layout">
          <div className="camera-wrapper">
            <CameraView
              analysis={analysis}
              isPaused={isPaused}
              onLandmarks={
                handleLandmarks
              }
            />
          </div>

          <div className="panel-wrapper">
            <AnalysisPanel
              exercise={exercise}
              analysis={analysis}
              time={time}
              isPaused={isPaused}
              onTogglePause={
                togglePause
              }
              onEndSession={
                endSession
              }
              onChangeExercise={
                changeExercise
              }
            />
          </div>
        </div>
      </main>

      {isComplete && (
        <SessionSummary
          data={{
            exercise,
            reps: analysis.reps,
            formScore:
              analysis.formScore,
            time,
          }}
          onRestart={
            resetSession
          }
        />
      )}
    </div>
  );
}
