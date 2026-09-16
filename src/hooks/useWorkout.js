import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createExerciseAnalyzer,
} from "../cv/analyzers/exerciseAnalyzers";

const INITIAL_ANALYSIS = {
  exercise: "Squat",
  reps: 0,
  formScore: 0,
  feedback:
    "Move into position to begin.",
  phase: "NOT READY",
  metric: null,
  kneeAngle: null,
  tracking: false,
  voiceMessage: null,
};

export function useWorkout(
  initialExercise = "Squat",
  landmarks = null
) {
  const [exercise, setExercise] =
    useState(initialExercise);

  const [isPaused, setIsPaused] =
    useState(false);

  const [isComplete, setIsComplete] =
    useState(false);

  const [time, setTime] =
    useState(0);

  const [analysis, setAnalysis] =
    useState({
      ...INITIAL_ANALYSIS,
      exercise: initialExercise,
    });

  const analyzerRef =
    useRef(
      createExerciseAnalyzer(
        initialExercise
      )
    );

  const startTimeRef =
    useRef(Date.now());

  const pausedAtRef =
    useRef(null);

  const pausedTotalRef =
    useRef(0);

  const changeExercise =
    useCallback((nextExercise) => {
      setExercise(nextExercise);

      analyzerRef.current?.reset?.();

      analyzerRef.current =
        createExerciseAnalyzer(
          nextExercise
        );

      setAnalysis({
        ...INITIAL_ANALYSIS,
        exercise: nextExercise,
        feedback:
          `Ready for ${nextExercise}.`,
      });
    }, []);

  useEffect(() => {
    if (
      isPaused ||
      isComplete
    ) {
      return;
    }

    const tick = () => {
      const now = Date.now();

      setTime(
        Math.max(
          0,
          Math.floor(
            (
              now -
              startTimeRef.current -
              pausedTotalRef.current
            ) / 1000
          )
        )
      );
    };

    tick();

    const id =
      window.setInterval(
        tick,
        250
      );

    return () =>
      window.clearInterval(id);
  }, [isPaused, isComplete]);

  useEffect(() => {
    if (
      isPaused ||
      isComplete
    ) {
      return;
    }

    const analyzer =
      analyzerRef.current;

    if (
      !analyzer ||
      !landmarks
    ) {
      return;
    }

    const next =
      analyzer.analyze(
        landmarks
      );

    if (!next) {
      return;
    }

    setAnalysis(next);
  }, [
    landmarks,
    isPaused,
    isComplete,
  ]);

  const togglePause =
    useCallback(() => {
      setIsPaused((current) => {
        if (!current) {
          pausedAtRef.current =
            Date.now();

          return true;
        }

        if (
          pausedAtRef.current != null
        ) {
          pausedTotalRef.current +=
            Date.now() -
            pausedAtRef.current;
        }

        pausedAtRef.current =
          null;

        return false;
      });
    }, []);

  const endSession =
    useCallback(() => {
      if (
        pausedAtRef.current != null
      ) {
        pausedTotalRef.current +=
          Date.now() -
          pausedAtRef.current;

        pausedAtRef.current =
          null;
      }

      setIsPaused(false);
      setIsComplete(true);
    }, []);

  const resetSession =
    useCallback(() => {
      setIsPaused(false);
      setIsComplete(false);
      setTime(0);

      startTimeRef.current =
        Date.now();

      pausedAtRef.current =
        null;

      pausedTotalRef.current =
        0;

      analyzerRef.current?.reset?.();

      setAnalysis({
        ...INITIAL_ANALYSIS,
        exercise,
        feedback:
          `Ready for ${exercise}.`,
      });
    }, [exercise]);

  return {
    exercise,
    isPaused,
    isComplete,
    time,
    analysis,
    togglePause,
    endSession,
    changeExercise,
    resetSession,
  };
}
