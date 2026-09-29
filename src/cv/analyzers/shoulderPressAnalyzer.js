import { calculateAngle } from "../geometry/angles";
import { ExponentialSmoother } from "../geometry/smoothing";

/*
 * ==========================================
 * RIGOR — SHOULDER PRESS ANALYZER
 * ==========================================
 *
 * Uses:
 * Shoulder → Elbow → Wrist
 *
 * Only ONE complete arm is required.
 *
 * STATE MACHINE
 *
 * NOT_READY
 *     ↓
 * READY
 *     ↓
 * PRESSING
 *     ↓
 * TOP
 *     ↓
 * LOWERING
 *     ↓
 * READY + 1 REP
 */

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;

const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

/*
 * Lower visibility requirement makes
 * webcam detection more tolerant.
 */
const VISIBILITY_THRESHOLD = 0.35;

/*
 * Elbow-angle thresholds.
 */
const READY_ANGLE = 135;
const PRESS_START_ANGLE = 145;
const TOP_ANGLE = 158;
const RETURN_ANGLE = 135;

/*
 * Voice cooldown.
 */
const VOICE_COOLDOWN = 1500;

function visible(point) {
  return Boolean(
    point &&
      (
        point.visibility == null ||
        point.visibility >=
          VISIBILITY_THRESHOLD
      )
  );
}

function getArm(
  landmarks,
  side
) {
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

  const angle =
    calculateAngle(
      shoulder,
      elbow,
      wrist
    );

  return {
    shoulder,
    elbow,
    wrist,
    angle,
    side,
  };
}

export function createShoulderPressAnalyzer() {
  const smoother =
    new ExponentialSmoother(0.20);

  let phase = "NOT_READY";

  let reps = 0;

  let activeArm = null;

  let currentAngle = null;
  let previousAngle = null;

  let reachedTop = false;
  let repCompleted = false;

  let lastVoiceMessage = "";
  let lastVoiceTime = 0;

  /*
   * Reset everything.
   */
  const reset = () => {
    smoother.reset?.();

    phase = "NOT_READY";

    reps = 0;

    activeArm = null;

    currentAngle = null;
    previousAngle = null;

    reachedTop = false;
    repCompleted = false;

    lastVoiceMessage = "";
    lastVoiceTime = 0;
  };

  /*
   * ------------------------------------------
   * SELECT ONE ARM
   * ------------------------------------------
   *
   * We do NOT require both arms.
   */
  const chooseArm = (landmarks) => {
    const left =
      getArm(
        landmarks,
        "LEFT"
      );

    const right =
      getArm(
        landmarks,
        "RIGHT"
      );

    /*
     * Keep current arm whenever possible.
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
     * Only left visible.
     */
    if (
      left &&
      !right
    ) {
      activeArm = "LEFT";
      return left;
    }

    /*
     * Only right visible.
     */
    if (
      right &&
      !left
    ) {
      activeArm = "RIGHT";
      return right;
    }

    /*
     * Both visible.
     *
     * Pick the arm with the more
     * stable starting angle.
     */
    if (
      left &&
      right
    ) {
      if (
        left.angle <=
        right.angle
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
   * ------------------------------------------
   * VOICE MESSAGE
   * ------------------------------------------
   *
   * This returns a string.
   *
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

    /*
     * Prevent repeated messages on
     * consecutive MediaPipe frames.
     */
    if (
      !force &&
      message === lastVoiceMessage &&
      now - lastVoiceTime <
        VOICE_COOLDOWN
    ) {
      return null;
    }

    /*
     * Small general cooldown.
     */
    if (
      !force &&
      now - lastVoiceTime <
        800
    ) {
      return null;
    }

    lastVoiceMessage =
      message;

    lastVoiceTime =
      now;

    return message;
  };

  /*
   * ------------------------------------------
   * MAIN ANALYZER
   * ------------------------------------------
   */
  const analyze = (landmarks) => {
    repCompleted = false;

    /*
     * Invalid pose data.
     */
    if (
      !Array.isArray(landmarks) ||
      landmarks.length < 17
    ) {
      return {
        exercise:
          "Shoulder Press",

        reps,

        formScore: 0,

        feedback:
          "Move into the camera frame.",

        phase:
          "NOT_READY",

        metric:
          "ELBOW ANGLE",

        elbowAngle:
          null,

        tracking:
          false,

        voiceMessage:
          null,

        activeArm:
          null,
      };
    }

    /*
     * Find one complete arm.
     */
    const arm =
      chooseArm(
        landmarks
      );

    /*
     * No usable arm.
     */
    if (!arm) {
      phase =
        "NOT_READY";

      currentAngle =
        null;

      previousAngle =
        null;

      return {
        exercise:
          "Shoulder Press",

        reps,

        formScore: 0,

        feedback:
          "Move back so one complete arm is visible.",

        phase:
          "NOT_READY",

        metric:
          "ELBOW ANGLE",

        elbowAngle:
          null,

        tracking:
          false,

        voiceMessage:
          null,

        activeArm:
          null,
      };
    }

    /*
     * Smooth elbow angle.
     */
    currentAngle =
      smoother.update(
        arm.angle
      );

    /*
     * Movement direction.
     *
     * Shoulder press:
     *
     * elbow angle increases
     * as the arm extends upward.
     */
    let direction =
      "STABLE";

    if (
      previousAngle !== null
    ) {
      if (
        currentAngle >
        previousAngle + 0.5
      ) {
        direction =
          "UP";
      }

      if (
        currentAngle <
        previousAngle - 0.5
      ) {
        direction =
          "DOWN";
      }
    }

    previousAngle =
      currentAngle;

    /*
     * ------------------------------------------
     * STATE MACHINE
     * ------------------------------------------
     */

    /*
     * NOT_READY → READY
     *
     * Start with elbow bent.
     */
    if (
      phase === "NOT_READY" &&
      currentAngle <=
        READY_ANGLE
    ) {
      phase =
        "READY";

      reachedTop =
        false;
    }

    /*
     * READY → PRESSING
     */
    if (
      phase === "READY" &&
      currentAngle >=
        PRESS_START_ANGLE
    ) {
      phase =
        "PRESSING";
    }

    /*
     * PRESSING → TOP
     *
     * We use elbow angle only.
     *
     * This is deliberate:
     * no dependency on perfectly
     * detected wrist height.
     */
    if (
      phase === "PRESSING" &&
      currentAngle >=
        TOP_ANGLE
    ) {
      phase =
        "TOP";

      reachedTop =
        true;
    }

    /*
     * TOP → LOWERING
     */
    if (
      phase === "TOP" &&
      currentAngle <=
        150
    ) {
      phase =
        "LOWERING";
    }

    /*
     * LOWERING → REP COMPLETE
     */
    if (
      phase === "LOWERING" &&
      reachedTop &&
      currentAngle <=
        RETURN_ANGLE
    ) {
      reps += 1;

      repCompleted =
        true;

      phase =
        "READY";

      reachedTop =
        false;
    }

    /*
     * ------------------------------------------
     * FEEDBACK
     * ------------------------------------------
     */

    let formScore =
      100;

    let feedback =
      "Control the movement.";

    let voiceMessage =
      null;

    /*
     * READY
     */
    if (
      phase === "READY"
    ) {
      feedback =
        "Press upward.";

      if (
        direction ===
        "UP"
      ) {
        voiceMessage =
          voice(
            "Press upward."
          );
      }
    }

    /*
     * PRESSING
     */
    if (
      phase === "PRESSING"
    ) {
      feedback =
        "Keep pressing overhead.";

      if (
        direction ===
        "UP"
      ) {
        voiceMessage =
          voice(
            "Keep pressing overhead."
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
        "Good extension. Lower slowly.";

      voiceMessage =
        voice(
          "Good extension. Lower slowly."
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
        direction ===
        "DOWN"
      ) {
        voiceMessage =
          voice(
            "Lower with control."
          );
      }
    }

    /*
     * REP COMPLETION
     *
     * Highest priority.
     */
    if (
      repCompleted
    ) {
      feedback =
        "Good rep.";

      voiceMessage =
        voice(
          "Good rep.",
          true
        );
    }

    return {
      exercise:
        "Shoulder Press",

      reps,

      formScore,

      feedback,

      phase,

      metric:
        "ELBOW ANGLE",

      elbowAngle:
        Math.round(
          currentAngle
        ),

      tracking:
        true,

      voiceMessage,

      activeArm,
    };
  };

  return {
    analyze,
    reset,
  };
}