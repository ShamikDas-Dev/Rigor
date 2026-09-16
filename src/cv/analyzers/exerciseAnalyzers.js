import {
  createDeadliftAnalyzer,
} from "./deadliftAnalyzer";

import {
  createSquatAnalyzer,
} from "./squatAnalyzer";

import {
  createPushUpAnalyzer,
} from "./pushUpAnalyzer";

import {
  createPlankAnalyzer,
} from "./plankAnalyzer";

import {
  createLegRaiseAnalyzer,
} from "./legRaiseAnalyzer";

export function createExerciseAnalyzer(
  exercise
) {
  const normalized =
    String(exercise || "")
      .trim()
      .toLowerCase();

  if (normalized === "squat") {
    return createSquatAnalyzer();
  }

  if (
    normalized === "push up" ||
    normalized === "push-up"
  ) {
    return createPushUpAnalyzer();
  }

  if (normalized === "plank") {
    return createPlankAnalyzer();
  }

  if (
    normalized === "leg raises" ||
    normalized === "leg raise"
  ) {
    return createLegRaiseAnalyzer();
  }

  if (normalized === "deadlift" || normalized === "dead lifts" || normalized === "dead lift") {
    return createDeadliftAnalyzer();
  }

  return {
    analyze() {
      return {
        exercise,
        reps: 0,
        formScore: 0,
        feedback:
          "This exercise analyzer is not enabled yet.",
        phase: "UNSUPPORTED",
        metric: null,
        kneeAngle: null,
        holdSeconds: 0,
        tracking: false,
        voiceMessage: null,
      };
    },

    reset() {},
  };
}
