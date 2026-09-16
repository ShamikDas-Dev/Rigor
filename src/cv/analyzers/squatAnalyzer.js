import {
  LANDMARKS,
  calculateBothKneeAngles,
  hasVisibleLandmarks,
} from "../geometry/angles";

import {
  ExponentialSmoother,
} from "../geometry/smoothing";

const REQUIRED = [
  LANDMARKS.LEFT_HIP,
  LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_KNEE,
  LANDMARKS.RIGHT_KNEE,
  LANDMARKS.LEFT_ANKLE,
  LANDMARKS.RIGHT_ANKLE,
];

const INITIAL_STATE = "NOT_READY";

export function createSquatAnalyzer() {
  const smoother =
    new ExponentialSmoother(0.22);

  let state = INITIAL_STATE;
  let reps = 0;
  let lastVoiceAt = 0;
  let lastFeedback = "";

  function reset() {
    smoother.reset();
    state = INITIAL_STATE;
    reps = 0;
    lastVoiceAt = 0;
    lastFeedback = "";
  }

  function emitVoice(
    message,
    force = false
  ) {
    const now =
      performance.now();

    if (
      !force &&
      now - lastVoiceAt <
        1800
    ) {
      return null;
    }

    if (
      !force &&
      message === lastFeedback &&
      now - lastVoiceAt <
        3000
    ) {
      return null;
    }

    lastVoiceAt = now;
    lastFeedback = message;

    return message;
  }

  function analyze(landmarks) {
    if (
      !hasVisibleLandmarks(
        landmarks,
        REQUIRED,
        0.55
      )
    ) {
      state = INITIAL_STATE;

      return {
        exercise: "Squat",
        reps,
        formScore: 0,
        feedback:
          "Move back so your full body is visible.",
        phase: "NOT READY",
        metric: null,
        kneeAngle: null,
        tracking: false,
        voiceMessage: emitVoice(
          "Move back so your full body is visible."
        ),
      };
    }

    const {
      left,
      right,
      average,
    } =
      calculateBothKneeAngles(
        landmarks
      );

    const kneeAngle =
      smoother.update(average);

    if (
      kneeAngle == null
    ) {
      return {
        exercise: "Squat",
        reps,
        formScore: 0,
        feedback:
          "Hold still for a moment.",
        phase: "NOT READY",
        metric: null,
        kneeAngle: null,
        tracking: false,
        voiceMessage: null,
      };
    }

    let formScore = 100;
    let feedback =
      "Good squat form.";
    let voiceMessage = null;

    switch (state) {
      case "NOT_READY":
        if (kneeAngle >= 160) {
          state = "UP";
          feedback =
            "Stand tall. Ready.";
          voiceMessage =
            emitVoice(
              "Stand tall. Ready."
            );
        } else {
          feedback =
            "Stand tall to start.";
          formScore = 85;
          voiceMessage =
            emitVoice(
              "Stand tall to start."
            );
        }
        break;

      case "UP":
        if (kneeAngle <= 150) {
          state = "DESCENDING";
          feedback =
            "Keep going down.";
          voiceMessage =
            emitVoice(
              "Keep going down."
            );
        } else {
          feedback =
            "Start your descent.";
        }
        break;

      case "DESCENDING":
        if (kneeAngle <= 108) {
          state = "BOTTOM";
          feedback =
            "Good depth. Drive up.";
          voiceMessage =
            emitVoice(
              "Good depth. Drive up."
            );
        } else if (kneeAngle <= 130) {
          feedback =
            "Keep going a little lower.";
          formScore = 88;
        } else {
          feedback =
            "Control the descent.";
          formScore = 94;
        }
        break;

      case "BOTTOM":
        if (kneeAngle >= 120) {
          state = "ASCENDING";
          feedback =
            "Drive up.";
        } else {
          feedback =
            "Good depth. Drive up.";
        }
        break;

      case "ASCENDING":
        if (kneeAngle >= 160) {
          reps += 1;
          state = "UP";

          feedback =
            "Good rep.";

          voiceMessage =
            emitVoice(
              "Good rep.",
              true
            );
        } else if (
          kneeAngle <= 112
        ) {
          feedback =
            "Keep driving upward.";
        } else {
          feedback =
            "Finish the rep.";
        }
        break;

      default:
        state = "NOT_READY";
        break;
    }

    // Conservative scoring: don't pretend the score is a
    // scientifically validated form percentage.
    if (
      state === "DESCENDING" &&
      kneeAngle > 130
    ) {
      formScore = Math.min(
        formScore,
        88
      );
    }

    return {
      exercise: "Squat",
      reps,
      formScore,
      feedback,
      phase: state,
      metric: Math.round(kneeAngle),
      kneeAngle: Math.round(kneeAngle),
      leftKneeAngle:
        Number.isFinite(left)
          ? Math.round(left)
          : null,
      rightKneeAngle:
        Number.isFinite(right)
          ? Math.round(right)
          : null,
      tracking: true,
      voiceMessage,
    };
  }

  return {
    analyze,
    reset,
  };
}
