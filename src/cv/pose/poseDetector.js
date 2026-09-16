import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

let poseLandmarker = null;

export async function initializePoseDetector() {
  if (poseLandmarker) {
    return poseLandmarker;
  }

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
);
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "CPU",
    },

    runningMode: "VIDEO",

    numPoses: 1,

    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return poseLandmarker;
}

export function detectPose(videoElement, timestamp) {
  if (!poseLandmarker) {
    throw new Error(
      "Pose detector has not been initialized."
    );
  }

  return poseLandmarker.detectForVideo(
    videoElement,
    timestamp
  );
}