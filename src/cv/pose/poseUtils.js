export function getLandmark(landmarks, index) {
  if (!landmarks || !landmarks[index]) {
    return null;
  }

  return landmarks[index];
}

export function calculateAngle(a, b, c) {
  if (!a || !b || !c) {
    return null;
  }

  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

export function calculateDistance(a, b) {
  if (!a || !b) {
    return null;
  }

  return Math.sqrt(
    Math.pow(b.x - a.x, 2) +
    Math.pow(b.y - a.y, 2) +
    Math.pow(b.z - a.z, 2)
  );
}

export function isLandmarkVisible(landmark, threshold = 0.5) {
  return landmark && (landmark.visibility ?? 0) >= threshold;
}
export function areRequiredLandmarksVisible(
  landmarks,
  indexes,
  threshold = 0.5
) {
  if (!landmarks) {
    return false;
  }

  return indexes.every((index) => {
    const landmark = landmarks[index];

    return (
      landmark &&
      (landmark.visibility ?? 0) >= threshold
    );
  });
}
export const SQUAT_LANDMARKS = {
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};