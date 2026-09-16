// src/hooks/useExerciseClassifier.js
import {
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL =
  "http://127.0.0.1:8001/predict-exercise";

const ACCEPT_CONFIDENCE = 0.65;
const REQUIRED_AGREEMENT = 3;
const INTERVAL_MS = 1000;

export function useExerciseClassifier(
  videoRef,
  enabled = true
) {
  const [
    exercise,
    setExercise,
  ] = useState(null);

  const [
    confidence,
    setConfidence,
  ] = useState(0);

  const [
    topPredictions,
    setTopPredictions,
  ] = useState([]);

  const [
    isClassifying,
    setIsClassifying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const canvasRef = useRef(null);
  const requestInFlightRef =
    useRef(false);

  const candidateRef = useRef(null);
  const candidateCountRef =
    useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const classifyFrame = async () => {
      const video =
        videoRef?.current;

      if (!video) return;

      if (
        video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      if (
        requestInFlightRef.current
      ) {
        return;
      }

      requestInFlightRef.current =
        true;

      setIsClassifying(true);

      try {
        if (!canvasRef.current) {
          canvasRef.current =
            document.createElement(
              "canvas"
            );
        }

        const canvas =
          canvasRef.current;

        const ctx =
          canvas.getContext("2d", {
            willReadFrequently: false,
          });

        const maxWidth = 640;

        const scale =
          Math.min(
            1,
            maxWidth /
              video.videoWidth
          );

        canvas.width =
          Math.round(
            video.videoWidth * scale
          );

        canvas.height =
          Math.round(
            video.videoHeight * scale
          );

        ctx.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const blob =
          await new Promise(
            (resolve) =>
              canvas.toBlob(
                resolve,
                "image/jpeg",
                0.8
              )
          );

        if (!blob) {
          throw new Error(
            "Unable to create camera frame."
          );
        }

        const formData =
          new FormData();

        formData.append(
          "file",
          blob,
          "frame.jpg"
        );

        const response =
          await fetch(API_URL, {
            method: "POST",
            body: formData,
          });

        if (!response.ok) {
          throw new Error(
            `Classifier HTTP ${response.status}`
          );
        }

        const result =
          await response.json();

        if (cancelled) {
          return;
        }

        setTopPredictions(
          result.top_predictions ||
            []
        );

        const predicted =
          String(
            result.exercise || ""
          ).trim();

        const currentConfidence =
          Number(
            result.confidence || 0
          );

        setConfidence(
          currentConfidence
        );

        if (
          !predicted ||
          currentConfidence <
            ACCEPT_CONFIDENCE
        ) {
          candidateRef.current =
            null;
          candidateCountRef.current =
            0;
          setIsClassifying(false);
          return;
        }

        if (
          candidateRef.current ===
          predicted
        ) {
          candidateCountRef.current += 1;
        } else {
          candidateRef.current =
            predicted;
          candidateCountRef.current = 1;
        }

        if (
          candidateCountRef.current >=
          REQUIRED_AGREEMENT
        ) {
          setExercise(predicted);
          candidateCountRef.current =
            REQUIRED_AGREEMENT;
        }

        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Exercise classifier error:",
            err
          );

          setError(
            err?.message ||
              "Exercise classification failed."
          );
        }
      } finally {
        if (!cancelled) {
          requestInFlightRef.current =
            false;
          setIsClassifying(false);
        }
      }
    };

    const initialTimeout =
      setTimeout(
        classifyFrame,
        1500
      );

    const interval =
      setInterval(
        classifyFrame,
        INTERVAL_MS
      );

    return () => {
      cancelled = true;
      clearTimeout(
        initialTimeout
      );
      clearInterval(interval);
    };
  }, [videoRef, enabled]);

  return {
    exercise,
    confidence,
    topPredictions,
    isClassifying,
    error,
  };
}
