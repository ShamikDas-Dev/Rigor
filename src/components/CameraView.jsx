import React, {
  useEffect,
  useRef,
} from "react";

import {
  AlertTriangle,
} from "lucide-react";

import { useCamera } from "../hooks/useCamera";
import { usePose } from "../hooks/usePose";
import { useVoiceFeedback } from "../hooks/useVoiceFeedback";

import { drawPose } from "../cv/pose/poseDrawing";

import Button from "./Button";

import "./CameraView.css";

export default function CameraView({
  analysis,
  isPaused,
  onLandmarks,
}) {
  const {
    videoRef,
    error: cameraError,
    isLoading,
    retry,
  } = useCamera();

  const canvasRef =
    useRef(null);

  /*
   * MediaPipe Pose
   */
  const {
    landmarks,
    isInitializing,
    isTracking,
    error: poseError,
    initialize,
    startDetection,
    stopDetection,
  } = usePose(videoRef);

  /*
   * RIGOR voice feedback
   */
  const {
    speak,
    stop,
    reset: resetVoice,
  } = useVoiceFeedback({
    enabled: true,
    volume: 1,
    rate: 1,
  });

  /*
   * Debug pose output.
   */
  useEffect(() => {
    console.log(
      "[RIGOR POSE]",
      landmarks
        ? `${landmarks.length} landmarks`
        : "NO LANDMARKS"
    );
  }, [landmarks]);

  /*
   * Initialize MediaPipe once the
   * camera video is ready.
   */
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    let cancelled = false;

    const startPose =
      async () => {
        if (
          cancelled ||
          video.readyState < 2
        ) {
          return;
        }

        const detector =
          await initialize();

        if (
          cancelled ||
          !detector
        ) {
          return;
        }

        startDetection();
      };

    video.addEventListener(
      "loadeddata",
      startPose
    );

    if (
      video.readyState >= 2
    ) {
      startPose();
    }

    return () => {
      cancelled = true;

      video.removeEventListener(
        "loadeddata",
        startPose
      );

      stopDetection();
    };
  }, [
    initialize,
    startDetection,
    stopDetection,
    videoRef,
  ]);

  /*
   * Send MediaPipe landmarks
   * to Workout.jsx.
   */
  useEffect(() => {
    onLandmarks?.(
      landmarks
    );
  }, [
    landmarks,
    onLandmarks,
  ]);

  /*
   * Draw skeleton.
   */
  useEffect(() => {
    const canvas =
      canvasRef.current;

    const video =
      videoRef.current;

    if (
      !canvas ||
      !video ||
      !landmarks
    ) {
      return;
    }

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    if (
      !width ||
      !height
    ) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    drawPose(
      canvas,
      landmarks,
      width,
      height
    );
  }, [
    landmarks,
    videoRef,
  ]);

  /*
   * ==========================
   * VOICE FEEDBACK
   * ==========================
   *
   * Analyzer generates:
   *
   * voiceMessage: "Good rep."
   *
   * This effect speaks it.
   */
  useEffect(() => {
    if (isPaused) {
      stop();
      return;
    }

    const message =
      typeof analysis?.voiceMessage ===
      "string"
        ? analysis.voiceMessage.trim()
        : "";

    if (!message) {
      return;
    }

    const isGoodRep =
      analysis?.feedback ===
      "Good rep.";

    console.log(
      "[RIGOR VOICE]",
      analysis?.exercise,
      "→",
      message
    );

    speak(message, {
      force: isGoodRep,
      priority:
        isGoodRep
          ? "high"
          : "normal",
    });
  }, [
    analysis?.voiceMessage,
    analysis?.feedback,
    analysis?.exercise,
    isPaused,
    speak,
    stop,
  ]);

  /*
   * Stop voice on cleanup.
   */
  useEffect(() => {
    return () => {
      stop();
      resetVoice();
    };
  }, [
    stop,
    resetVoice,
  ]);

  /*
   * Camera error.
   */
  if (cameraError) {
    return (
      <div className="camera-container camera-error">
        <AlertTriangle
          size={48}
          className="error-icon"
        />

        <h3>
          CAMERA ACCESS REQUIRED
        </h3>

        <p>
          Please allow camera access
          to begin your workout.
        </p>

        <Button
          variant="secondary"
          onClick={retry}
        >
          TRY AGAIN
        </Button>
      </div>
    );
  }

  return (
    <div className="camera-container">

      {(isLoading ||
        isInitializing) && (
        <div className="camera-loading">
          INITIALIZING SENSOR...
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-feed"
      />

      <canvas
        ref={canvasRef}
        className="pose-canvas"
      />

      {!isPaused && (
        <div className="cv-overlays">

          <div className="overlay-top-left">

            <span className="cv-label">
              EXERCISE
            </span>

            <span className="cv-exercise">
              {analysis?.exercise
                ?.toUpperCase() ||
                "ANALYZING"}
            </span>

            <span
              className="cv-phase"
              style={{
                display: "block",
                marginTop: "8px",
                color: "#B7FF00",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {String(
                analysis?.phase ||
                "NOT READY"
              ).replace(
                "_",
                " "
              )}
            </span>

          </div>

          <div className="overlay-top-right">

            <div className="cv-stat">
              <span className="cv-stat-label">
                FORM
              </span>

              <span className="cv-stat-value accent">
                {analysis?.formScore ??
                  0}
                %
              </span>
            </div>

            <div className="cv-stat">
              <span className="cv-stat-label">
                REPS
              </span>

              <span className="cv-stat-value">
                {analysis?.reps ??
                  0}
              </span>
            </div>

          </div>

          <div className="overlay-bottom-left">

            <div className="status-indicator">

              <span
                className={`pulse-dot ${
                  isTracking
                    ? ""
                    : "not-tracking"
                }`}
              />

              <span className="status-text">
                {poseError
                  ? "POSE ERROR"
                  : isTracking
                    ? "TRACKING"
                    : "NO PERSON DETECTED"}
              </span>

            </div>

          </div>

        </div>
      )}

      {isPaused && (
        <div className="paused-overlay">
          <span>
            SESSION PAUSED
          </span>
        </div>
      )}

    </div>
  );
}