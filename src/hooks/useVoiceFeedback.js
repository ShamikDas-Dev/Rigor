import { useCallback, useEffect, useRef } from "react";

function toSpeechText(value) {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";

  if (typeof value === "object") {
    const candidate =
      value.text ??
      value.message ??
      value.voiceMessage ??
      value.feedback;

    return typeof candidate === "string" ? candidate.trim() : "";
  }

  return String(value).trim();
}

export function useVoiceFeedback({
  enabled = true,
  volume = 1,
  rate = 1,
} = {}) {
  const speakingRef = useRef(false);
  const pendingRef = useRef("");
  const lastSpokenRef = useRef("");
  const lastSpokenAtRef = useRef(0);
  const utteranceRef = useRef(null);
  const stopTokenRef = useRef(0);

  const speakNextRef = useRef(null);

  const stop = useCallback(() => {
    stopTokenRef.current += 1;
    speakingRef.current = false;
    pendingRef.current = "";
    utteranceRef.current = null;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const startSpeaking = useCallback((text) => {
    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const token = stopTokenRef.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.volume = volume;

    speakingRef.current = true;
    utteranceRef.current = utterance;

    const finish = () => {
      if (utteranceRef.current !== utterance) return;

      utteranceRef.current = null;
      speakingRef.current = false;

      const pending = pendingRef.current;
      pendingRef.current = "";

      if (pending && token === stopTokenRef.current) {
        window.setTimeout(() => {
          if (token === stopTokenRef.current) {
            speakNextRef.current?.(pending);
          }
        }, 50);
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch {
      finish();
    }
  }, [rate, volume]);

  speakNextRef.current = startSpeaking;

  const speak = useCallback((message, { force = false, priority = "normal" } = {}) => {
    if (!enabled) return;

    const text = toSpeechText(message);
    if (!text) return;

    const now = Date.now();
    const cooldown = priority === "high" ? 700 : 1800;

    if (
      !force &&
      text === lastSpokenRef.current &&
      now - lastSpokenAtRef.current < cooldown
    ) {
      return;
    }

    lastSpokenRef.current = text;
    lastSpokenAtRef.current = now;

    if (speakingRef.current) {
      // Replace stale pending feedback instead of building a queue.
      pendingRef.current = text;
      return;
    }

    startSpeaking(text);
  }, [enabled, startSpeaking]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  return { speak, stop };
}
