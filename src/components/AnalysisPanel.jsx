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
  const normalizedExercise = String(exercise || "").toLowerCase();
  const isPushUp = normalizedExercise.includes("push up");
  const isPlank = normalizedExercise === "plank";
  const isLegRaise = normalizedExercise === "leg raises" || normalizedExercise === "leg raise";
  const isDeadlift = normalizedExercise === "deadlift" || normalizedExercise === "dead lift" || normalizedExercise === "dead lifts";

  let metric = null;
  let metricLabel = "KNEE ANGLE";

  if (isPushUp) {
    metric = Number.isFinite(analysis?.elbowAngle) ? analysis.elbowAngle : null;
    metricLabel = "ELBOW ANGLE";
  } else if (isPlank) {
    metric = Number.isFinite(analysis?.bodyAngle) ? analysis.bodyAngle : null;
    metricLabel = "BODY ANGLE";
  } else if (isLegRaise || isDeadlift) {
    metric = Number.isFinite(analysis?.hipAngle) ? analysis.hipAngle : null;
    metricLabel = "HIP ANGLE";
  } else {
    metric = Number.isFinite(analysis?.kneeAngle) ? analysis.kneeAngle : null;
  }

  return (
    <aside className="analysis-panel">
      <div className="panel-section">
        <label className="panel-label" htmlFor="exercise-select">CURRENT EXERCISE</label>
        <select
          id="exercise-select"
          className="exercise-select"
          value={exercise}
          onChange={(event) => onChangeExercise(event.target.value)}
          disabled={isPaused}
        >
          {allExercises.map((item) => (
            <option key={item} value={item}>{item.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="panel-divider" />

      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-label">REPETITIONS</span>
          <span className="metric-value">{analysis.reps}</span>
        </div>

        <div className="metric">
          <span className="metric-label">{metricLabel}</span>
          <span className="metric-value">
            {metric !== null ? `${Number(metric).toFixed(1)}°` : "--"}
          </span>
        </div>

        {isPlank && (
          <div className="metric">
            <span className="metric-label">HOLD TIME</span>
            <span className="metric-value">
              {Number.isFinite(analysis?.holdSeconds) ? `${analysis.holdSeconds}s` : "0s"}
            </span>
          </div>
        )}

        <div className="metric">
          <span className="metric-label">FORM SCORE</span>
          <span className="metric-value accent">{analysis.formScore}%</span>
        </div>

        <div className="metric">
          <span className="metric-label">SESSION TIME</span>
          <span className="metric-value mono">{formatTime(time)}</span>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="panel-section">
        <span className="panel-label">CURRENT FEEDBACK</span>
        <p className="feedback-text">"{analysis.feedback}"</p>
      </div>

      <div className="panel-spacer" />

      <div className="panel-controls">
        <Button
          variant="secondary"
          className="control-btn"
          onClick={onTogglePause}
          icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
        >
          {isPaused ? "RESUME" : "PAUSE"}
        </Button>

        <Button
          variant="danger"
          className="control-btn"
          onClick={onEndSession}
          icon={<Square size={16} />}
        >
          END WORKOUT
        </Button>
      </div>
    </aside>
  );
}
