import { calculateAngle } from "../geometry/angles";
import { ExponentialSmoother } from "../geometry/smoothing";

/*
 * MediaPipe Pose landmark indexes
 *
 * LEFT:
 * 11 = shoulder
 * 13 = elbow
 * 15 = wrist
 *
 * RIGHT:
 * 12 = shoulder
 * 14 = elbow
 * 16 = wrist
 */

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;

const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

const VISIBILITY_THRESHOLD = 0.35;

/*
 * Rep thresholds
 */
const START_EXTENSION = 145;
const START_CURL = 125;
const TOP_POSITION = 90;
const RETURN_EXTENSION = 145;

/*
 * Voice cooldown
 */
const VOICE_COOLDOWN = 1500;

function visible(point) {
  return Boolean(
    point &&
      (
        point.visibility == null ||
        point.visibility >= VISIBILITY_THRESHOLD
      )
  );
}

function getArm(landmarks, side) {
  const shoulderIndex =
    side === "LEFT"
      ? LEFT_SHOULDER
      : RIGHT_SHOULDER;

  const elbowIndex =
    side === "LEFT"
      ? LEFT_ELBOW
      : RIGHT_ELBOW;

  const wristIndex =
    side === "LEFT"
      ? LEFT_WRIST
      : RIGHT_WRIST;

  const shoulder =
    landmarks[shoulderIndex];

  const elbow =
    landmarks[elbowIndex];

  const wrist =
    landmarks[wristIndex];

  if (
    !visible(shoulder) ||
    !visible(elbow) ||
    !visible(wrist)
  ) {
    return null;
  }

  const angle = calculateAngle(
    shoulder,
    elbow,
    wrist
  );

  return {
    side,
    shoulder,
    elbow,
    wrist,
    angle,
  };
}

export function createBicepCurlAnalyzer() {
  const angleSmoother =
    new ExponentialSmoother(0.20);

  let phase = "NOT_READY";
  let reps = 0;

  let activeArm = null;

  let smoothedAngle = null;
  let previousAngle = null;

  let reachedTop = false;
  let repCompleted = false;

  let lastVoiceMessage = "";
  let lastVoiceTime = 0;

  const reset = () => {
    angleSmoother.reset?.();

    phase = "NOT_READY";
    reps = 0;

    activeArm = null;

    smoothedAngle = null;
    previousAngle = null;

    reachedTop = false;
    repCompleted = false;

    lastVoiceMessage = "";
    lastVoiceTime = 0;
  };

  /*
   * Choose an arm.
   *
   * We intentionally allow ONE arm.
   * The user does not need both wrists visible.
   */
  const chooseArm = (landmarks) => {
    const left = getArm(
      landmarks,
      "LEFT"
    );

    const right = getArm(
      landmarks,
      "RIGHT"
    );

    /*
     * Keep current arm if it remains visible.
     */
    if (
      activeArm === "LEFT" &&
      left
    ) {
      return left;
    }

    if (
      activeArm === "RIGHT" &&
      right
    ) {
      return right;
    }

    /*
     * Select whichever complete arm
     * is available.
     */
    if (left && !right) {
      activeArm = "LEFT";
      return left;
    }

    if (right && !left) {
      activeArm = "RIGHT";
      return right;
    }

    /*
     * Both visible.
     *
     * Select the more extended arm
     * as the starting reference.
     */
    if (left && right) {
      if (
        left.angle >= right.angle
      ) {
        activeArm = "LEFT";
        return left;
      }

      activeArm = "RIGHT";
      return right;
    }

    return null;
  };

  /*
   * Voice event generator.
   *
   * The analyzer ONLY returns text.
   * CameraView is responsible for speaking it.
   */
  const voice = (
    message,
    force = false
  ) => {
    if (!message) {
      return null;
    }

    const now = Date.now();

    if (
      !force &&
      message === lastVoiceMessage &&
      now - lastVoiceTime <
        VOICE_COOLDOWN
    ) {
      return null;
    }

    if (
      !force &&
      now - lastVoiceTime < 800
    ) {
      return null;
    }

    lastVoiceMessage =
      message;

    lastVoiceTime = now;

    return message;
  };

  const analyze = (landmarks) => {
    /*
     * New frame = new completion flag.
     */
    repCompleted = false;

    /*
     * No pose data.
     */
    if (
      !Array.isArray(landmarks) ||
      landmarks.length < 17
    ) {
      return {
        exercise: "Bicep Curl",
        reps,
        formScore: 0,
        feedback:
          "Move into the camera frame.",
        phase: "NOT READY",
        metric: "ELBOW ANGLE",
        elbowAngle: null,
        tracking: false,
        voiceMessage: null,
        activeArm: null,
      };
    }

    /*
     * Find one complete arm.
     */
    const arm =
      chooseArm(landmarks);

    /*
     * Shoulder/elbow visible but wrist
     * not visible = cannot calculate curl.
     */
    if (!arm) {
      phase = "NOT_READY";

      smoothedAngle = null;
      previousAngle = null;

      return {
        exercise: "Bicep Curl",
        reps,
        formScore: 0,
        feedback:
          "Move back so one full arm is visible.",
        phase: "NOT READY",
        metric: "ELBOW ANGLE",
        elbowAngle: null,
        tracking: false,
        voiceMessage: null,
        activeArm: null,
      };
    }

    /*
     * Smooth elbow angle.
     */
    smoothedAngle =
      angleSmoother.update(
        arm.angle
      );

    /*
     * Movement direction.
     */
    let direction = "STABLE";

    if (
      previousAngle !== null
    ) {
      if (
        smoothedAngle <
        previousAngle - 0.5
      ) {
        direction = "UP";
      } else if (
        smoothedAngle >
        previousAngle + 0.5
      ) {
        direction = "DOWN";
      }
    }

    previousAngle =
      smoothedAngle;

    /*
     * ============================
     * STATE MACHINE
     * ============================
     */

    /*
     * NOT READY → READY
     *
     * User starts with arm extended.
     */
    if (
      phase === "NOT_READY" &&
      smoothedAngle >=
        START_EXTENSION
    ) {
      phase = "READY";
      reachedTop = false;
    }

    /*
     * READY → CURLING
     */
    if (
      phase === "READY" &&
      smoothedAngle <=
        START_CURL
    ) {
      phase = "CURLING";
    }

    /*
     * CURLING → TOP
     */
    if (
      phase === "CURLING" &&
      smoothedAngle <=
        TOP_POSITION
    ) {
      phase = "TOP";
      reachedTop = true;
    }

    /*
     * TOP → LOWERING
     */
    if (
      phase === "TOP" &&
      smoothedAngle >= 105
    ) {
      phase = "LOWERING";
    }

    /*
     * LOWERING → REP COMPLETE
     */
    if (
      phase === "LOWERING" &&
      reachedTop &&
      smoothedAngle >=
        RETURN_EXTENSION
    ) {
      reps += 1;

      repCompleted = true;

      phase = "READY";

      reachedTop = false;
    }

    /*
     * ============================
     * FEEDBACK
     * ============================
     */

    let formScore = 100;
    let feedback =
      "Control the movement.";

    let voiceMessage = null;

    /*
     * READY
     */
    if (
      phase === "READY"
    ) {
      feedback =
        "Curl upward.";

      if (
        direction === "UP"
      ) {
        voiceMessage =
          voice(
            "Curl upward."
          );
      }
    }

    /*
     * CURLING
     */
    if (
      phase === "CURLING"
    ) {
      feedback =
        "Keep curling.";

      if (
        direction === "UP"
      ) {
        voiceMessage =
          voice(
            "Keep curling."
          );
      }
    }

    /*
     * TOP
     */
    if (
      phase === "TOP"
    ) {
      feedback =
        "Good contraction. Lower slowly.";

      voiceMessage =
        voice(
          feedback
        );
    }

    /*
     * LOWERING
     */
    if (
      phase === "LOWERING"
    ) {
      feedback =
        "Lower with control.";

      if (
        direction === "DOWN"
      ) {
        voiceMessage =
          voice(
            feedback
          );
      }
    }

    /*
     * REP COMPLETED
     *
     * Highest-priority voice event.
     */
    if (repCompleted) {
      feedback =
        "Good rep.";

      voiceMessage =
        voice(
          "Good rep.",
          true
        );
    }

    return {
      exercise: "Bicep Curl",

      reps,

      formScore,

      feedback,

      phase,

      metric:
        "ELBOW ANGLE",

      elbowAngle:
        Math.round(
          smoothedAngle
        ),

      tracking: true,

      voiceMessage,

      activeArm,
    };
  };

  return {
    analyze,
    reset,
  };
}