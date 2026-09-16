import {
  LANDMARKS,
  calculateAngle,
  getPoint,
  hasVisibleLandmarks,
} from "../geometry/angles";

import {
  ExponentialSmoother,
} from "../geometry/smoothing";

const REQUIRED = [
  LANDMARKS.LEFT_SHOULDER,
  LANDMARKS.RIGHT_SHOULDER,
  LANDMARKS.LEFT_HIP,
  LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_ANKLE,
  LANDMARKS.RIGHT_ANKLE,
];

function averagePoint(landmarks, aIndex, bIndex) {
  const a = getPoint(landmarks, aIndex);
  const b = getPoint(landmarks, bIndex);

  if (!a && !b) return null;

  if (a && b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  }

  return a || b;
}

function calculateBodyLineAngle(landmarks) {
  const shoulder = averagePoint(
    landmarks,
    LANDMARKS.LEFT_SHOULDER,
    LANDMARKS.RIGHT_SHOULDER
  );

  const hip = averagePoint(
    landmarks,
    LANDMARKS.LEFT_HIP,
    LANDMARKS.RIGHT_HIP
  );

  const ankle = averagePoint(
    landmarks,
    LANDMARKS.LEFT_ANKLE,
    LANDMARKS.RIGHT_ANKLE
  );

  if (!shoulder || !hip || !ankle) {
    return null;
  }

  return calculateAngle(
    shoulder,
    hip,
    ankle
  );
}

export function createPlankAnalyzer() {
  const angleSmoother =
    new ExponentialSmoother(0.18);

  let state = "NOT_READY";
  let holdStart = null;
  let holdSeconds = 0;
  let lastVoiceAt = 0;
  let lastMessage = "";

  function reset() {
    angleSmoother.reset();
    state = "NOT_READY";
    holdStart = null;
    holdSeconds = 0;
    lastVoiceAt = 0;
    lastMessage = "";
  }

  function voice(message, force = false) {
    const now = performance.now();

    if (
      !force &&
      now - lastVoiceAt < 2200
    ) {
      return null;
    }

    if (
      !force &&
      message === lastMessage &&
      now - lastVoiceAt < 3500
    ) {
      return null;
    }

    lastVoiceAt = now;
    lastMessage = message;

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
      state = "NOT_READY";
      holdStart = null;
      holdSeconds = 0;

      return {
        exercise: "Plank",
        reps: 0,
        formScore: 0,
        feedback:
          "Move into a side view with your full body visible.",
        phase: "NOT READY",
        metric: null,
        bodyAngle: null,
        holdSeconds: 0,
        tracking: false,
        voiceMessage: voice(
          "Move into a side view with your full body visible."
        ),
      };
    }

    const rawAngle =
      calculateBodyLineAngle(
        landmarks
      );

    const bodyAngle =
      angleSmoother.update(
        rawAngle
      );

    if (bodyAngle == null) {
      state = "NOT_READY";
      holdStart = null;
      holdSeconds = 0;

      return {
        exercise: "Plank",
        reps: 0,
        formScore: 0,
        feedback:
          "Hold still so I can track your body.",
        phase: "NOT READY",
        metric: null,
        bodyAngle: null,
        holdSeconds: 0,
        tracking: false,
        voiceMessage: null,
      };
    }

    // A straight shoulder-hip-ankle line is near 180 degrees.
    // We intentionally use a conservative tolerance.
    const deviation =
      Math.abs(180 - bodyAngle);

    const valid =
      deviation <= 10;

    let formScore = 100;
    let feedback = "Great plank.";
    let voiceMessage = null;

    if (!valid) {
      state = "CORRECT_FORM";
      holdStart = null;
      holdSeconds = 0;

      formScore =
        deviation <= 15 ? 80 : 60;

      if (bodyAngle < 170) {
        feedback =
          "Keep your hips aligned. Avoid dropping your hips.";
        voiceMessage = voice(
          "Keep your hips aligned."
        );
      } else {
        feedback =
          "Lower your hips slightly.";
        voiceMessage = voice(
          "Lower your hips slightly."
        );
      }

      return {
        exercise: "Plank",
        reps: 0,
        formScore,
        feedback,
        phase: "CORRECT FORM",
        metric: Math.round(bodyAngle),
        bodyAngle: Math.round(bodyAngle),
        holdSeconds: 0,
        tracking: true,
        voiceMessage,
      };
    }

    if (state !== "HOLDING") {
      state = "HOLDING";
      holdStart = performance.now();
      holdSeconds = 0;

      feedback =
        "Good position. Hold steady.";
      voiceMessage = voice(
        "Good position. Hold steady.",
        true
      );
    } else {
      holdSeconds = Math.floor(
        (
          performance.now() -
          holdStart
        ) / 1000
      );

      if (
        holdSeconds > 0 &&
        holdSeconds % 10 === 0
      ) {
        feedback =
          `${holdSeconds} seconds. Keep holding.`;
      } else {
        feedback =
          "Great plank. Keep holding.";
      }
    }

    return {
      exercise: "Plank",
      reps: 0,
      formScore: 100,
      feedback,
      phase: "HOLDING",
      metric: Math.round(bodyAngle),
      bodyAngle: Math.round(bodyAngle),
      holdSeconds,
      tracking: true,
      voiceMessage,
    };
  }

  return {
    analyze,
    reset,
  };
}
