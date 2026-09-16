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
  LANDMARKS.LEFT_ELBOW,
  LANDMARKS.RIGHT_ELBOW,
  15, // left wrist
  16, // right wrist
  LANDMARKS.LEFT_HIP,
  LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_ANKLE,
  LANDMARKS.RIGHT_ANKLE,
];

const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

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

function bodyLineDeviation(landmarks) {
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

  const dx1 = hip.x - shoulder.x;
  const dy1 = hip.y - shoulder.y;
  const dx2 = ankle.x - hip.x;
  const dy2 = ankle.y - hip.y;

  const mag1 = Math.hypot(dx1, dy1);
  const mag2 = Math.hypot(dx2, dy2);

  if (!mag1 || !mag2) {
    return null;
  }

  const cosine =
    Math.max(
      -1,
      Math.min(
        1,
        (dx1 * dx2 + dy1 * dy2) / (mag1 * mag2)
      )
    );

  const angle =
    Math.acos(cosine) * (180 / Math.PI);

  // 180° is a straight line.
  return Math.abs(180 - angle);
}

export function createPushUpAnalyzer() {
  const smoother =
    new ExponentialSmoother(0.2);

  let state = "NOT_READY";
  let reps = 0;
  let lastVoiceAt = 0;
  let lastMessage = "";

  function reset() {
    smoother.reset();
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
        exercise: "Push Up",
        reps,
        formScore: 0,
        feedback:
          "Move into a side view with your full body visible.",
        phase: "NOT READY",
        metric: null,
        elbowAngle: null,
        bodyLineDeviation: null,
        tracking: false,
        voiceMessage: voice(
          "Move into a side view with your full body visible."
        ),
      };
    }

    const leftElbow = calculateAngle(
      getPoint(landmarks, LANDMARKS.LEFT_SHOULDER),
      getPoint(landmarks, LANDMARKS.LEFT_ELBOW),
      getPoint(landmarks, LEFT_WRIST)
    );

    const rightElbow = calculateAngle(
      getPoint(landmarks, LANDMARKS.RIGHT_SHOULDER),
      getPoint(landmarks, LANDMARKS.RIGHT_ELBOW),
      getPoint(landmarks, RIGHT_WRIST)
    );

    const rawElbow = averageOf([
      leftElbow,
      rightElbow,
    ]);

    const elbowAngle =
      smoother.update(rawElbow);

    if (elbowAngle == null) {
      return {
        exercise: "Push Up",
        reps,
        formScore: 0,
        feedback:
          "Hold still so I can track your arms.",
        phase: "NOT READY",
        metric: null,
        elbowAngle: null,
        bodyLineDeviation: null,
        tracking: false,
        voiceMessage: null,
      };
    }

    const deviation =
      bodyLineDeviation(landmarks);

    let score = 100;
    let feedback = "Good push-up form.";
    let voiceMessage = null;

    // First establish a straight-arm top position.
    if (state === "NOT_READY") {
      if (elbowAngle >= 150) {
        state = "UP";
        feedback =
          "Good starting position.";
        voiceMessage = voice(
          "Good starting position."
        );
      } else {
        state = "NOT_READY";
        feedback =
          "Straighten your arms to start.";
        score = 85;
        voiceMessage = voice(
          "Straighten your arms to start."
        );
      }
    } else if (state === "UP") {
      if (elbowAngle <= 140) {
        state = "DESCENDING";
        feedback = "Lower under control.";
        voiceMessage = voice(
          "Lower under control."
        );
      } else {
        feedback = "Lower your chest.";
      }
    } else if (state === "DESCENDING") {
      if (elbowAngle <= 95) {
        state = "BOTTOM";
        feedback =
          "Good depth. Push back up.";
        voiceMessage = voice(
          "Good depth. Push back up."
        );
      } else {
        feedback =
          elbowAngle > 110
            ? "Lower your chest further."
            : "Keep the descent controlled.";

        score = elbowAngle > 110 ? 85 : 92;
      }
    } else if (state === "BOTTOM") {
      if (elbowAngle >= 120) {
        state = "ASCENDING";
        feedback = "Keep pushing.";
      } else {
        feedback = "Push up strongly.";
      }
    } else if (state === "ASCENDING") {
      if (elbowAngle >= 155) {
        state = "UP";
        reps += 1;
        feedback = "Good rep.";
        voiceMessage = voice(
          "Good rep.",
          true
        );
      } else {
        feedback = "Finish the rep.";
      }
    }

    // Body-line form check. A large deviation usually means
    // hips are sagging or piking.
    if (
      Number.isFinite(deviation) &&
      deviation > 12
    ) {
      score = Math.min(score, 68);

      if (deviation > 18) {
        feedback =
          "Keep your hips aligned with your shoulders.";

        voiceMessage =
          voice(
            "Keep your hips aligned with your shoulders."
          );
      } else {
        feedback =
          "Keep your body in a straight line.";

        voiceMessage =
          voice(
            "Keep your body in a straight line."
          );
      }
    }

    return {
      exercise: "Push Up",
      reps,
      formScore: score,
      feedback,
      phase: state,
      metric: Math.round(elbowAngle),
      elbowAngle: Math.round(elbowAngle),
      bodyLineDeviation:
        Number.isFinite(deviation)
          ? Math.round(deviation)
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
