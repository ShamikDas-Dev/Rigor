import { createSquatAnalyzer } from "./squatAnalyzer";
import { createPushUpAnalyzer } from "./pushUpAnalyzer";
import { createPlankAnalyzer } from "./plankAnalyzer";
import { createLegRaiseAnalyzer } from "./legRaiseAnalyzer";
import { createDeadliftAnalyzer } from "./deadliftAnalyzer";
import { createBicepCurlAnalyzer } from "./bicepCurlAnalyzer";
import {createShoulderPressAnalyzer} from "./shoulderPressAnalyzer";
const normalizeExercise = (exercise = "") =>
  String(exercise)
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

export const createExerciseAnalyzer = (exercise) => {
  const normalized = normalizeExercise(exercise);

  if (normalized === "squat") {
    return createSquatAnalyzer();
  }

  if (
    normalized === "push up" ||
    normalized === "pushup"
  ) {
    return createPushUpAnalyzer();
  }

  if (normalized === "plank") {
    return createPlankAnalyzer();
  }

  if (
    normalized === "leg raise" ||
    normalized === "leg raises"
  ) {
    return createLegRaiseAnalyzer();
  }

  if (normalized === "deadlift") {
    return createDeadliftAnalyzer();
  }

  if (
    normalized === "bicep curl" ||
    normalized === "biceps curl" ||
    normalized === "bicep curls" ||
    normalized === "biceps curls"
  ) {
    return createBicepCurlAnalyzer();
  }
  if (
  normalized === "shoulder press" ||
  normalized === "shoulder presses"
) {
  return createShoulderPressAnalyzer();
}
  // Safe fallback for unsupported exercises.
  return {
    analyze() {
      return {
        exercise,
        reps: 0,
        formScore: 0,
        feedback:
          "This exercise analyzer is not enabled yet.",
        phase: "NOT READY",
        metric: null,
        kneeAngle: null,
        elbowAngle: null,
        hipAngle: null,
        bodyAngle: null,
        tracking: false,
        voiceMessage: null,
      };
    },

    reset() {},
  };
};