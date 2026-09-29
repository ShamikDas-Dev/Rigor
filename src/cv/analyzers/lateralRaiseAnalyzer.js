import { LANDMARKS } from "../geometry/angles";
import { ExponentialSmoother } from "../geometry/smoothing";

/*
 * ==========================================
 * RIGOR — LATERAL RAISE ANALYZER
 * ==========================================
 *
 * Primary metric:
 *
 * ARM ELEVATION ANGLE
 *
 * Arm down       ≈ 0°
 * Arm horizontal ≈ 90°
 * Arm overhead   ≈ 180°
 *
 * One complete arm is enough.
 *
 * STATE MACHINE
 *
 * NOT_READY
 *     ↓
 * READY
 *     ↓
 * RAISING
 *     ↓
 * TOP
 *     ↓
 * LOWERING
 *     ↓
 * READY + 1 REP
 */

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

const VISIBILITY_THRESHOLD = 0.35;

/*
 * Rep thresholds.
 *
 * These are intentionally forgiving.
 */
const READY_ANGLE = 25;
const START_RAISE_ANGLE = 35;
const TOP_ANGLE = 70;
const RETURN_ANGLE = 25;

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

/*
 * Calculate arm elevation from vertical.
 *
 * Arm straight down:
 *   dx ≈ 0
 *   dy > 0
 *   angle ≈ 0°
 *
 * Arm horizontal:
 *   dx large
 *   dy ≈ 0
 *   angle ≈ 90°
 */
function calculateElevation(
  shoulder,
  wrist
) {
  const dx =
    wrist.x -
    shoulder.x;

  const dy =
    wrist.y -
    shoulder.y;

  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    (180 / Math.PI);

  return Math.max(
    0,
    Math.min(180, angle)
  );
}

function getArm(
  landmarks,
  side
) {
  const shoulder =
    landmarks[
      side === "LEFT"
        ? LEFT_SHOULDER
        : RIGHT_SHOULDER
    ];

  const wrist =
    landmarks[
      side === "LEFT"
        ? LEFT_WRIST
        : RIGHT_WRIST
    ];

  if (
    !visible(shoulder) ||
    !visible(wrist)
  ) {
    return null;
  }

  return {
    side,
    shoulder,
    wrist,

    angle:
      calculateElevation(
        shoulder,
        wrist
      ),
  };
}

export function createLateralRaiseAnalyzer() {
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
   * =========================================
   * CHOOSE ARM
   * =========================================
   */
  const chooseArm = (
    landmarks
  ) => {
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
     * Keep selected arm if still visible.
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
     * One arm.
     */
    if (
      left &&
      !right
    ) {
      activeArm = "LEFT";
      return left;
    }

    if (
      right &&
      !left
    ) {
      activeArm = "RIGHT";
      return right;
    }

    /*
     * Both arms.
     *
     * Choose the arm currently closer
     * to the starting/down position.
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
   * =========================================
   * VOICE
   * =========================================
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
      message ===
        lastVoiceMessage &&
      now - lastVoiceTime <
        VOICE_COOLDOWN
    ) {
      return null;
    }

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
   * =========================================
   * ANALYZE
   * =========================================
   */
  const analyze = (
    landmarks
  ) => {
    repCompleted = false;

    /*
     * Invalid pose.
     */
    if (
      !Array.isArray(
        landmarks
      ) ||
      landmarks.length < 17
    ) {
      return {
        exercise:
          "Lateral Raises",

        reps,

        formScore: 0,

        feedback:
          "Move into the camera frame.",

        phase:
          "NOT_READY",

        metric:
          "ARM ANGLE",

        armAngle:
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
     * Select one arm.
     */
    const arm =
      chooseArm(
        landmarks
      );

    if (!arm) {
      phase =
        "NOT_READY";

      currentAngle =
        null;

      previousAngle =
        null;

      return {
        exercise:
          "Lateral Raises",

        reps,

        formScore: 0,

        feedback:
          "Keep one complete arm visible.",

        phase:
          "NOT_READY",

        metric:
          "ARM ANGLE",

        armAngle:
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
     * Smooth the arm angle.
     */
    currentAngle =
      smoother.update(
        arm.angle
      );

    /*
     * Determine direction.
     *
     * Increasing angle = raising.
     * Decreasing angle = lowering.
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
      } else if (
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
     * =========================================
     * STATE MACHINE
     * =========================================
     */

    /*
     * NOT_READY → READY
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
     * READY → RAISING
     */
    if (
      phase === "READY" &&
      currentAngle >=
        START_RAISE_ANGLE
    ) {
      phase =
        "RAISING";
    }

    /*
     * RAISING → TOP
     */
    if (
      phase === "RAISING" &&
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
        60
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
     * =========================================
     * FEEDBACK
     * =========================================
     */

    let formScore = 100;

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
        "Raise your arm.";

      if (
        direction ===
        "UP"
      ) {
        voiceMessage =
          voice(
            "Raise your arm."
          );
      }
    }

    /*
     * RAISING
     */
    if (
      phase === "RAISING"
    ) {
      feedback =
        "Raise to shoulder height.";

      if (
        direction ===
        "UP"
      ) {
        voiceMessage =
          voice(
            "Raise to shoulder height."
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
        "Good height. Lower slowly.";

      voiceMessage =
        voice(
          "Good height. Lower slowly."
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
     * REP COMPLETE
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
        "Lateral Raises",

      reps,

      formScore,

      feedback,

      phase,

      metric:
        "ARM ANGLE",

      armAngle:
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