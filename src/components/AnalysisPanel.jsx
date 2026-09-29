import React from "react";
import { Pause, Play, Square } from "lucide-react";
import { formatTime } from "../utils/formatTime";
import { allExercises } from "../data/exercises";
import Button from "./Button";
import "./AnalysisPanel.css";

export default function AnalysisPanel({
  exercise,
  analysis,
  time,
  isPaused,
  onTogglePause,
  onEndSession,
  onChangeExercise,
}) {
  const normalizedExercise = String(
    exercise || ""
  )
    .trim()
    .toLowerCase();

  const isPushUp =
    normalizedExercise.includes("push up") ||
    normalizedExercise.includes("pushup");

  const isBicepCurl =
    normalizedExercise === "bicep curl" ||
    normalizedExercise === "biceps curl" ||
    normalizedExercise === "bicep curls" ||
    normalizedExercise === "biceps curls";

  const isPlank =
    normalizedExercise === "plank";

  const isLegRaise =
    normalizedExercise === "leg raises" ||
    normalizedExercise === "leg raise";

  const isDeadlift =
    normalizedExercise === "deadlift" ||
    normalizedExercise === "dead lift" ||
    normalizedExercise === "dead lifts";

  const isShoulderPress =
  normalizedExercise === "shoulder press" ||
  normalizedExercise === "shoulder presses";
  let metric = null;
  let metricLabel = "KNEE ANGLE";

  /*
   * PUSH UP
   */
if (isPushUp) {
  metric = Number.isFinite(
    analysis?.elbowAngle
  )
    ? analysis.elbowAngle
    : null;

  metricLabel = "ELBOW ANGLE";
}

else if (isBicepCurl) {
  metric = Number.isFinite(
    analysis?.elbowAngle
  )
    ? analysis.elbowAngle
    : null;

  metricLabel = "ELBOW ANGLE";
}

else if (isShoulderPress) {
  metric = Number.isFinite(
    analysis?.elbowAngle
  )
    ? analysis.elbowAngle
    : null;

  metricLabel = "ELBOW ANGLE";
}

else if (isPlank) {
  metric = Number.isFinite(
    analysis?.bodyAngle
  )
    ? analysis.bodyAngle
    : null;

  metricLabel = "BODY ANGLE";
}

else if (isLegRaise) {
  metric = Number.isFinite(
    analysis?.hipAngle
  )
    ? analysis.hipAngle
    : null;

  metricLabel = "HIP ANGLE";
}

else if (isDeadlift) {
  metric = Number.isFinite(
    analysis?.hipAngle
  )
    ? analysis.hipAngle
    : null;

  metricLabel = "HIP ANGLE";
}

else {
  metric = Number.isFinite(
    analysis?.kneeAngle
  )
    ? analysis.kneeAngle
    : null;

  metricLabel = "KNEE ANGLE";
}

  return (
    <aside className="analysis-panel">

      {/* CURRENT EXERCISE */}
      <div className="panel-section">
        <label
          className="panel-label"
          htmlFor="exercise-select"
        >
          CURRENT EXERCISE
        </label>

        <select
          id="exercise-select"
          className="exercise-select"
          value={exercise}
          onChange={(event) =>
            onChangeExercise(
              event.target.value
            )
          }
          disabled={isPaused}
        >
          {allExercises.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="panel-divider" />

      {/* METRICS */}
      <div className="metrics-grid">

        {/* REPS */}
        <div className="metric">
          <span className="metric-label">
            REPETITIONS
          </span>

          <span className="metric-value">
            {Number.isFinite(
              analysis?.reps
            )
              ? analysis.reps
              : 0}
          </span>
        </div>

        {/* EXERCISE METRIC */}
        <div className="metric">
          <span className="metric-label">
            {metricLabel}
          </span>

          <span className="metric-value">
            {metric !== null
              ? `${Number(metric).toFixed(1)}°`
              : "--"}
          </span>
        </div>

        {/* PLANK HOLD TIME */}
        {isPlank && (
          <div className="metric">
            <span className="metric-label">
              HOLD TIME
            </span>

            <span className="metric-value">
              {Number.isFinite(
                analysis?.holdSeconds
              )
                ? `${analysis.holdSeconds}s`
                : "0s"}
            </span>
          </div>
        )}

        {/* FORM SCORE */}
        <div className="metric">
          <span className="metric-label">
            FORM SCORE
          </span>

          <span className="metric-value accent">
            {Number.isFinite(
              analysis?.formScore
            )
              ? `${analysis.formScore}%`
              : "0%"}
          </span>
        </div>

        {/* SESSION TIME */}
        <div className="metric">
          <span className="metric-label">
            SESSION TIME
          </span>

          <span className="metric-value mono">
            {formatTime(time)}
          </span>
        </div>

      </div>

      <div className="panel-divider" />

      {/* CURRENT FEEDBACK */}
      <div className="panel-section">
        <span className="panel-label">
          CURRENT FEEDBACK
        </span>

        <p className="feedback-text">
          "{analysis?.feedback ||
            "Move into position to begin."}"
        </p>
      </div>

      <div className="panel-spacer" />

      {/* CONTROLS */}
      <div className="panel-controls">

        <Button
          variant="secondary"
          className="control-btn"
          onClick={onTogglePause}
          icon={
            isPaused ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )
          }
        >
          {isPaused
            ? "RESUME"
            : "PAUSE"}
        </Button>

        <Button
          variant="danger"
          className="control-btn"
          onClick={onEndSession}
          icon={
            <Square size={16} />
          }
        >
          END WORKOUT
        </Button>

      </div>

    </aside>
  );
}