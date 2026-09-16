import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  initializePoseDetector,
  detectPose,
} from "../cv/pose/poseDetector";

export function usePose(videoRef) {
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const runningRef = useRef(false);
  const lastTimestampRef = useRef(-1);

  const [landmarks, setLandmarks] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  const initialize = useCallback(async () => {
    if (detectorRef.current) {
      return detectorRef.current;
    }

    try {
      setIsInitializing(true);
      setError(null);

      console.log("POSE: Initializing MediaPipe...");

      const detector = await initializePoseDetector();

      detectorRef.current = detector;

      console.log("POSE: MediaPipe initialized.");

      setIsInitializing(false);

      return detector;
    } catch (err) {
      console.error(
        "POSE: Initialization failed:",
        err
      );

      setError(
        err?.message ||
        "Unable to initialize pose detection."
      );

      setIsInitializing(false);

      return null;
    }
  }, []);

  const detect = useCallback(() => {
    const video = videoRef?.current;
    const detector = detectorRef.current;

    if (!video) {
      console.log("POSE: Video element missing.");
      return;
    }

    if (!detector) {
      console.log("POSE: Detector missing.");
      return;
    }

    if (video.readyState < 2) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      console.log(
        "POSE: Invalid video dimensions:",
        video.videoWidth,
        video.videoHeight
      );
      return;
    }

    const timestamp = performance.now();

    if (timestamp <= lastTimestampRef.current) {
      return;
    }

    lastTimestampRef.current = timestamp;

    try {
      const result = detectPose(
        video,
        timestamp
      );

      console.log(
        "POSE RESULT:",
        result
      );

      const detectedLandmarks =
        result?.landmarks?.[0] ?? null;

      if (detectedLandmarks) {
        console.log(
          "POSE: DETECTED",
          detectedLandmarks.length,
          "landmarks"
        );

        setLandmarks(detectedLandmarks);
        setIsTracking(true);
      } else {
        console.log(
          "POSE: No person detected in frame."
        );

        setLandmarks(null);
        setIsTracking(false);
      }
    } catch (err) {
      console.error(
        "POSE: Detection error:",
        err
      );

      setError(
        err?.message ||
        "Pose detection failed."
      );

      setIsTracking(false);

      throw err;
    }
  }, [videoRef]);

  const startDetection = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;

    console.log("POSE: Detection loop started.");

    const loop = () => {
      if (!runningRef.current) {
        return;
      }

      try {
        detect();
      } catch {
        runningRef.current = false;
        return;
      }

      animationFrameRef.current =
        requestAnimationFrame(loop);
    };

    animationFrameRef.current =
      requestAnimationFrame(loop);
  }, [detect]);

  const stopDetection = useCallback(() => {
    runningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current = null;
    }

    setLandmarks(null);
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    landmarks,
    isInitializing,
    isTracking,
    error,
    initialize,
    startDetection,
    stopDetection,
  };
}