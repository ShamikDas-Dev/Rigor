import {
  LANDMARKS,
  calculateAngle,
  getPoint,
  hasVisibleLandmarks,
  averageOf,
} from "../geometry/angles";

import {
  ExponentialSmoother,
} from "../geometry/smoothing";

const REQUIRED = [
  LANDMARKS.LEFT_SHOULDER,
  LANDMARKS.RIGHT_SHOULDER,
  LANDMARKS.LEFT_HIP,
  LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_KNEE,
  LANDMARKS.RIGHT_KNEE,
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

function calculateTorsoLegAngle(
  landmarks,
  side
) {
  const shoulderIndex =
    side === "left"
      ? LANDMARKS.LEFT_SHOULDER
      : LANDMARKS.RIGHT_SHOULDER;

  const hipIndex =
    side === "left"
      ? LANDMARKS.LEFT_HIP
      : LANDMARKS.RIGHT_HIP;

  const ankleIndex =
    side === "left"
      ? LANDMARKS.LEFT_ANKLE
      : LANDMARKS.RIGHT_ANKLE;

  return calculateAngle(
    getPoint(landmarks, shoulderIndex),
    getPoint(landmarks, hipIndex),
    getPoint(landmarks, ankleIndex)
  );
}

function calculateKneeStraightness(
  landmarks,
  side
) {
  const shoulderIndex =
    side === "left"
      ? LANDMARKS.LEFT_SHOULDER
      : LANDMARKS.RIGHT_SHOULDER;

  const hipIndex =
    side === "left"
      ? LANDMARKS.LEFT_HIP
      : LANDMARKS.RIGHT_HIP;

  const kneeIndex =
    side === "left"
      ? LANDMARKS.LEFT_KNEE
      : LANDMARKS.RIGHT_KNEE;

  const ankleIndex =
    side === "left"
      ? LANDMARKS.LEFT_ANKLE
      : LANDMARKS.RIGHT_ANKLE;

  return calculateAngle(
    getPoint(landmarks, hipIndex),
    getPoint(landmarks, kneeIndex),
    getPoint(landmarks, ankleIndex)
  );
}

export function createLegRaiseAnalyzer() {
  const hipSmoother =
    new ExponentialSmoother(0.2);

  const kneeSmoother =
    new ExponentialSmoother(0.2);

  let state = "NOT_READY";
  let reps = 0;
  let lastVoiceAt = 0;
  let lastMessage = "";

  function reset() {
    hipSmoother.reset();
    kneeSmoother.reset();
    state = "NOT_READY";
    reps = 0;
    lastVoiceAt = 0;
    lastMessage = "";
  }

  function voice(message, force = false) {
    const now = performance.now();

    if (
      !force &&
      now - lastVoiceAt < 1800
    ) {
      return null;
    }

    if (
      !force &&
      message === lastMessage &&
      now - lastVoiceAt < 3000
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

      return {
        exercise: "Leg Raises",
        reps,
        formScore: 0,
        feedback:
          "Lie down and keep your full body visible.",
        phase: "NOT READY",
        metric: null,
        hipAngle: null,
        kneeAngle: null,
        tracking: false,
        voiceMessage: voice(
          "Lie down and keep your full body visible."
        ),
      };
    }

    const leftHip =
      calculateTorsoLegAngle(
        landmarks,
        "left"
      );

    const rightHip =
      calculateTorsoLegAngle(
        landmarks,
        "right"
      );

    const hipAngle =
      hipSmoother.update(
        averageOf([
          leftHip,
          rightHip,
        ])
      );

    const leftKnee =
      calculateKneeStraightness(
        landmarks,
        "left"
      );

    const rightKnee =
      calculateKneeStraightness(
        landmarks,
        "right"
      );

    const kneeAngle =
      kneeSmoother.update(
        averageOf([
          leftKnee,
          rightKnee,
        ])
      );

    if (
      hipAngle == null ||
      kneeAngle == null
    ) {
      state = "NOT_READY";

      return {
        exercise: "Leg Raises",
        reps,
        formScore: 0,
        feedback:
          "Hold still so I can track your legs.",
        phase: "NOT READY",
        metric: null,
        hipAngle: null,
        kneeAngle: null,
        tracking: false,
        voiceMessage: null,
      };
    }

    // Leg raise is treated as:
    // legs lowered -> raise -> controlled return.
    // The thresholds are deliberately conservative.
    const straightLegs =
      kneeAngle >= 150;

    let score = 100;
    let feedback =
      "Good leg raise.";
    let voiceMessage = null;

    if (
      !straightLegs &&
      state !== "NOT_READY"
    ) {
      score = 75;
      feedback =
        "Keep your legs straighter.";
      voiceMessage = voice(
        "Keep your legs straighter."
      );
    }

    if (state === "NOT_READY") {
      if (
        hipAngle >= 145 &&
        kneeAngle >= 150
      ) {
        state = "DOWN";
        feedback =
          "Ready. Raise your legs.";
        voiceMessage = voice(
          "Ready. Raise your legs."
        );
      } else {
        feedback =
          "Extend your legs fully to start.";
        score = 85;
      }
    } else if (state === "DOWN") {
      if (hipAngle <= 90) {
        state = "UP";
        feedback =
          "Good height. Lower slowly.";
        voiceMessage = voice(
          "Good height. Lower slowly."
        );
      } else if (hipAngle <= 115) {
        state = "RAISING";
        feedback =
          "Keep raising your legs.";
      } else {
        feedback =
          "Raise your legs higher.";
        score = 88;
      }
    } else if (state === "RAISING") {
      if (hipAngle <= 90) {
        state = "UP";
        feedback =
          "Good height. Lower slowly.";
        voiceMessage = voice(
          "Good height. Lower slowly."
        );
      } else if (hipAngle > 140) {
        state = "DOWN";
      } else {
        feedback =
          "Keep your movement controlled.";
      }
    } else if (state === "UP") {
      if (hipAngle >= 145) {
        state = "DOWN";
        reps += 1;
        feedback = "Good rep.";
        voiceMessage = voice(
          "Good rep.",
          true
        );
      } else if (hipAngle > 110) {
        state = "LOWERING";
        feedback =
          "Lower your legs with control.";
      } else {
        feedback =
          "Keep lowering slowly.";
      }
    } else if (state === "LOWERING") {
      if (hipAngle >= 145) {
        state = "DOWN";
        reps += 1;
        feedback = "Good rep.";
        voiceMessage = voice(
          "Good rep.",
          true
        );
      }
    }

    // Torso should stay relatively stable. We use
    // shoulder/hip/ground relationships as a conservative
    // indicator rather than claiming spinal measurements.
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

    if (shoulder && hip) {
      const torsoShift =
        Math.abs(
          shoulder.y - hip.y
        );

      if (torsoShift < 0.06) {
        score = Math.min(score, 88);
      }
    }

    return {
      exercise: "Leg Raises",
      reps,
      formScore: score,
      feedback,
      phase: state,
      metric: Math.round(hipAngle),
      hipAngle: Math.round(hipAngle),
      kneeAngle: Math.round(kneeAngle),
      tracking: true,
      voiceMessage,
    };
  }

  return {
    analyze,
    reset,
  };
}
