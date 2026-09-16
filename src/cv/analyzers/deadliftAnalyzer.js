import { LANDMARKS, calculateAngle, hasVisibleLandmarks } from "../geometry/angles";

const REQUIRED = [
  LANDMARKS.LEFT_SHOULDER,
  LANDMARKS.LEFT_HIP,
  LANDMARKS.LEFT_KNEE,
  LANDMARKS.LEFT_ANKLE,
  LANDMARKS.RIGHT_SHOULDER,
  LANDMARKS.RIGHT_HIP,
  LANDMARKS.RIGHT_KNEE,
  LANDMARKS.RIGHT_ANKLE,
];

function avg(a, b) {
  return (a + b) / 2;
}

function makeSmoother(alpha = 0.22) {
  let value = null;
  return {
    push(next) {
      value = value == null ? next : value + alpha * (next - value);
      return value;
    },
    reset() {
      value = null;
    },
  };
}

function torsoDeviationFromVertical(shoulder, hip) {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

export function createDeadliftAnalyzer() {
  let reps = 0;
  let phase = "NOT_READY";
  let lastFeedback = "";
  let lastVoiceAt = 0;

  const hipSmoother = makeSmoother(0.22);
  const kneeSmoother = makeSmoother(0.22);
  const torsoSmoother = makeSmoother(0.22);

  const reset = () => {
    reps = 0;
    phase = "NOT_READY";
    lastFeedback = "";
    lastVoiceAt = 0;
    hipSmoother.reset();
    kneeSmoother.reset();
    torsoSmoother.reset();
  };

  const getVoiceMessage = (message, force = false) => {
    const text = typeof message === "string" ? message.trim() : "";
    if (!text) return null;

    const now = Date.now();
    if (
      force ||
      text !== lastFeedback ||
      now - lastVoiceAt >= 1800
    ) {
      lastFeedback = text;
      lastVoiceAt = now;
      return text;
    }

    return null;
  };

  const analyze = (landmarks) => {
    if (!hasVisibleLandmarks(landmarks, REQUIRED)) {
      phase = "NOT_READY";
      const feedback = "Move farther back so your full body is visible.";
      return {
        exercise: "Deadlift",
        reps,
        formScore: 0,
        feedback,
        phase,
        metric: null,
        hipAngle: null,
        kneeAngle: null,
        torsoAngle: null,
        tracking: false,
        voiceMessage: getVoiceMessage(feedback),
      };
    }

    const ls = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rs = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const lh = landmarks[LANDMARKS.LEFT_HIP];
    const rh = landmarks[LANDMARKS.RIGHT_HIP];
    const lk = landmarks[LANDMARKS.LEFT_KNEE];
    const rk = landmarks[LANDMARKS.RIGHT_KNEE];
    const la = landmarks[LANDMARKS.LEFT_ANKLE];
    const ra = landmarks[LANDMARKS.RIGHT_ANKLE];

    const hipAngle = hipSmoother.push(
      avg(
        calculateAngle(ls, lh, lk),
        calculateAngle(rs, rh, rk)
      )
    );

    const kneeAngle = kneeSmoother.push(
      avg(
        calculateAngle(lh, lk, la),
        calculateAngle(rh, rk, ra)
      )
    );

    const torsoAngle = torsoSmoother.push(
      avg(
        torsoDeviationFromVertical(ls, lh),
        torsoDeviationFromVertical(rs, rh)
      )
    );

    // Hysteresis thresholds make the state machine less sensitive to frame noise.
    const standing = hipAngle >= 160 && kneeAngle >= 150;
    const enteringHinge = hipAngle <= 150;
    const bottom = hipAngle <= 115;
    const rising = hipAngle >= 132;

    let formScore = 100;
    if (torsoAngle > 40) formScore -= 20;
    if (torsoAngle > 55) formScore -= 20;
    if (kneeAngle < 100 && bottom) formScore -= 15;
    formScore = Math.max(0, Math.round(formScore));

    let feedback = "Ready.";

    switch (phase) {
      case "NOT_READY":
        if (standing) {
          phase = "STANDING";
          feedback = "Push your hips back to start.";
        } else {
          feedback = "Stand tall to start.";
        }
        break;

      case "STANDING":
        if (enteringHinge) {
          phase = "HINGING";
          feedback = torsoAngle > 55
            ? "Keep your back more neutral."
            : "Push your hips back.";
        } else {
          feedback = "Push your hips back.";
        }
        break;

      case "HINGING":
        if (bottom) {
          phase = "BOTTOM";
          feedback = torsoAngle > 55
            ? "Keep your back more neutral."
            : "Good position. Drive up.";
        } else {
          feedback = torsoAngle > 55
            ? "Keep your back more neutral."
            : "Keep pushing your hips back.";
        }
        break;

      case "BOTTOM":
        if (rising) {
          phase = "RISING";
          feedback = "Drive through your hips.";
        } else {
          feedback = torsoAngle > 55
            ? "Keep your back more neutral."
            : "Drive up.";
        }
        break;

      case "RISING":
        if (standing) {
          phase = "STANDING";
          reps += 1;
          feedback = "Good rep.";
        } else {
          feedback = torsoAngle > 55
            ? "Keep your back more neutral."
            : "Drive through your hips.";
        }
        break;

      default:
        phase = "NOT_READY";
        feedback = "Stand tall to start.";
    }

    return {
      exercise: "Deadlift",
      reps,
      formScore,
      feedback,
      phase,
      metric: hipAngle,
      hipAngle,
      kneeAngle,
      torsoAngle,
      tracking: true,
      voiceMessage: getVoiceMessage(feedback, feedback === "Good rep."),
    };
  };

  return { analyze, reset };
}
