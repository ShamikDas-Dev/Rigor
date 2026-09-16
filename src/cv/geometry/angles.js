export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getPoint(landmarks, index) {
  return landmarks?.[index] ?? null;
}

export function isVisible(
  landmark,
  minimumVisibility = 0.55
) {
  return Boolean(
    landmark &&
      (
        landmark.visibility == null ||
        landmark.visibility >= minimumVisibility
      )
  );
}

export function hasVisibleLandmarks(
  landmarks,
  indices,
  minimumVisibility = 0.55
) {
  if (!Array.isArray(landmarks)) {
    return false;
  }

  return indices.every((index) =>
    isVisible(
      getPoint(landmarks, index),
      minimumVisibility
    )
  );
}

export function calculateAngle(a, b, c) {
  if (!a || !b || !c) {
    return null;
  }

  const abx = a.x - b.x;
  const aby = a.y - b.y;

  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot =
    abx * cbx +
    aby * cby;

  const magnitudeAB =
    Math.hypot(abx, aby);

  const magnitudeCB =
    Math.hypot(cbx, cby);

  if (
    magnitudeAB < 1e-6 ||
    magnitudeCB < 1e-6
  ) {
    return null;
  }

  const cosine = clamp(
    dot /
      (magnitudeAB * magnitudeCB),
    -1,
    1
  );

  return (
    Math.acos(cosine) *
    (180 / Math.PI)
  );
}

export function averageOf(values) {
  const valid = values.filter(
    (value) =>
      Number.isFinite(value)
  );

  if (!valid.length) {
    return null;
  }

  return (
    valid.reduce(
      (sum, value) => sum + value,
      0
    ) / valid.length
  );
}

export function calculateBothKneeAngles(
  landmarks
) {
  const left = calculateAngle(
    getPoint(
      landmarks,
      LANDMARKS.LEFT_HIP
    ),
    getPoint(
      landmarks,
      LANDMARKS.LEFT_KNEE
    ),
    getPoint(
      landmarks,
      LANDMARKS.LEFT_ANKLE
    )
  );

  const right = calculateAngle(
    getPoint(
      landmarks,
      LANDMARKS.RIGHT_HIP
    ),
    getPoint(
      landmarks,
      LANDMARKS.RIGHT_KNEE
    ),
    getPoint(
      landmarks,
      LANDMARKS.RIGHT_ANKLE
    )
  );

  return {
    left,
    right,
    average: averageOf([
      left,
      right,
    ]),
  };
}
