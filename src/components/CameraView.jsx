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

  const {
    landmarks,
    isInitializing,
    isTracking,
    error: poseError,
    initialize,
    startDetection,
    stopDetection,
  } = usePose(videoRef);

  const {
    speak,
    stop,
  } = useVoiceFeedback({
    enabled: true,
    rate: 1,
    volume: 1,
  });

  useEffect(() => {
    if (!analysis?.voiceMessage) {
      return;
    }

    speak(
      analysis.voiceMessage,
      {
        force:
          analysis.feedback ===
          "Good rep.",
      }
    );
  }, [
    analysis?.voiceMessage,
    analysis?.feedback,
    speak,
  ]);

  useEffect(() => {
    if (isPaused) {
      stop();
    }
  }, [isPaused, stop]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    const startPose =
      async () => {
        if (video.readyState < 2) {
          return;
        }

        const detector =
          await initialize();

        if (!detector) {
          return;
        }

        startDetection();
      };

    video.addEventListener(
      "loadeddata",
      startPose
    );

    if (video.readyState >= 2) {
      startPose();
    }

    return () => {
      video.removeEventListener(
        "loadeddata",
        startPose
      );

      stopDetection();
      stop();
    };
  }, [
    initialize,
    startDetection,
    stopDetection,
    stop,
    videoRef,
  ]);

  useEffect(() => {
    onLandmarks?.(landmarks);
  }, [
    landmarks,
    onLandmarks,
  ]);

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

    if (!width || !height) {
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
              {String(
                analysis.exercise ||
                  "SQUAT"
              ).toUpperCase()}
            </span>

            <span
              style={{
                display: "block",
                marginTop: 6,
                fontSize: 12,
                color: "#B7FF00",
              }}
            >
              {analysis.phase}
            </span>
          </div>

          <div className="overlay-top-right">
            <div className="cv-stat">
              <span className="cv-stat-label">
                FORM
              </span>

              <span className="cv-stat-value accent">
                {analysis.formScore}%
              </span>
            </div>

            <div className="cv-stat">
              <span className="cv-stat-label">
                REPS
              </span>

              <span className="cv-stat-value">
                {analysis.reps}
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
                    : "MOVE INTO VIEW"}
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
