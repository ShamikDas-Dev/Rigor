import { useCallback, useEffect, useRef } from "react";

/*
 * Convert anything passed by an analyzer into safe speech text.
 *
 * Supported:
 *   "Keep your elbows stable."
 *   { message: "Keep your elbows stable." }
 *   { voiceMessage: "Keep your elbows stable." }
 *   { feedback: "Keep your elbows stable." }
 */
function toSpeechText(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return "";
  }

  if (typeof value === "object") {
    const candidate =
      value.voiceMessage ??
      value.message ??
      value.text ??
      value.feedback;

    if (typeof candidate === "string") {
      return candidate.trim();
    }
  }

  return String(value).trim();
}

export function useVoiceFeedback({
  enabled = true,
  volume = 1,
  rate = 1,
  lang = "en-US",
} = {}) {
  const speakingRef = useRef(false);
  const currentTextRef = useRef("");
  const pendingTextRef = useRef("");

  const lastTextRef = useRef("");
  const lastSpokenAtRef = useRef(0);

  const utteranceRef = useRef(null);
  const stopGenerationRef = useRef(0);

  const speakNextRef = useRef(null);

  /*
   * Completely stop current and pending speech.
   */
  const stop = useCallback(() => {
    stopGenerationRef.current += 1;

    speakingRef.current = false;
    currentTextRef.current = "";
    pendingTextRef.current = "";
    utteranceRef.current = null;

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /*
   * Speak one message.
   */
  const startSpeaking = useCallback(
    (text) => {
      if (
        !text ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        return;
      }

      const generation = stopGenerationRef.current;

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = lang;
      utterance.rate = Math.max(0.5, Math.min(rate, 2));
      utterance.volume = Math.max(
        0,
        Math.min(volume, 1)
      );

      speakingRef.current = true;
      currentTextRef.current = text;
      utteranceRef.current = utterance;

      const finish = () => {
        if (
          utteranceRef.current !== utterance
        ) {
          return;
        }

        utteranceRef.current = null;
        speakingRef.current = false;
        currentTextRef.current = "";

        const pending =
          pendingTextRef.current;

        pendingTextRef.current = "";

        if (
          pending &&
          generation ===
            stopGenerationRef.current
        ) {
          window.setTimeout(() => {
            if (
              generation ===
              stopGenerationRef.current
            ) {
              speakNextRef.current?.(
                pending
              );
            }
          }, 40);
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      try {
        /*
         * Chrome can occasionally leave the speech engine paused.
         */
        window.speechSynthesis.resume();

        window.speechSynthesis.speak(
          utterance
        );
      } catch (error) {
        console.error(
          "[RIGOR VOICE] Speech error:",
          error
        );

        finish();
      }
    },
    [lang, rate, volume]
  );

  speakNextRef.current = startSpeaking;

  /*
   * Public speech function.
   */
  const speak = useCallback(
    (
      message,
      {
        force = false,
        priority = "normal",
      } = {}
    ) => {
      if (!enabled) {
        return;
      }

      const text = toSpeechText(message);

      if (!text) {
        return;
      }

      const now = Date.now();

      /*
       * High priority messages such as
       * "Good rep." get a shorter cooldown.
       */
      const cooldown =
        priority === "high"
          ? 700
          : 1500;

      /*
       * Prevent the same message from being
       * repeatedly spoken every pose frame.
       */
      if (
        !force &&
        text === lastTextRef.current &&
        now - lastSpokenAtRef.current <
          cooldown
      ) {
        return;
      }

      /*
       * Ignore rapid duplicate requests.
       */
      if (
        !force &&
        now - lastSpokenAtRef.current <
          500
      ) {
        return;
      }

      lastTextRef.current = text;
      lastSpokenAtRef.current = now;

      /*
       * If something is already speaking,
       * replace the pending message instead
       * of creating a long queue.
       */
      if (speakingRef.current) {
        pendingTextRef.current = text;
        return;
      }

      startSpeaking(text);
    },
    [enabled, startSpeaking]
  );

  /*
   * Reset the duplicate-message state.
   */
  const reset = useCallback(() => {
    lastTextRef.current = "";
    lastSpokenAtRef.current = 0;
    pendingTextRef.current = "";
  }, []);

  /*
   * Stop everything when the component
   * using this hook is unmounted.
   */
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  /*
   * Disable speech immediately when enabled
   * becomes false.
   */
  useEffect(() => {
    if (!enabled) {
      stop();
    }
  }, [enabled, stop]);

  return {
    speak,
    stop,
    reset,
  };
}