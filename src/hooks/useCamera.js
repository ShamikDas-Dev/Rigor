import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useCamera() {
  const [stream, setStream] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  /*
   * Stop a specific MediaStream.
   */
  const stopStream = useCallback(
    (mediaStream) => {
      if (!mediaStream) {
        return;
      }

      mediaStream
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.warn(
              "Failed to stop camera track:",
              error
            );
          }
        });
    },
    []
  );

  /*
   * Start camera.
   */
  const startCamera =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "Camera API not supported in this browser."
          );
        }

        /*
         * Stop an existing stream before
         * requesting a new one.
         */
        stopStream(streamRef.current);
        streamRef.current = null;

        const mediaStream =
          await navigator.mediaDevices
            .getUserMedia({
              video: {
                facingMode: "user",
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              },
              audio: false,
            });

        if (!mountedRef.current) {
          stopStream(mediaStream);
          return;
        }

        streamRef.current =
          mediaStream;

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject =
            mediaStream;

          /*
           * Explicit play helps on some mobile
           * browsers after the stream attaches.
           */
          try {
            await videoRef.current.play();
          } catch {
            /*
             * Autoplay may still be controlled
             * by browser policy.
             */
          }
        }
      } catch (err) {
        console.error(
          "Camera error:",
          err
        );

        if (!mountedRef.current) {
          return;
        }

        if (
          err?.name ===
          "NotAllowedError"
        ) {
          setError("PERMISSION_DENIED");
        } else if (
          err?.name ===
          "NotFoundError"
        ) {
          setError("NO_CAMERA");
        } else if (
          err?.name ===
          "NotReadableError"
        ) {
          setError("CAMERA_IN_USE");
        } else {
          setError("DEVICE_ERROR");
        }

        setStream(null);
        streamRef.current = null;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    }, [stopStream]);

  /*
   * Stop camera.
   */
  const stopCamera =
    useCallback(() => {
      stopStream(streamRef.current);

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      if (mountedRef.current) {
        setStream(null);
      }
    }, [stopStream]);

  /*
   * Mount / unmount lifecycle.
   */
  useEffect(() => {
    mountedRef.current = true;

    startCamera();

    return () => {
      mountedRef.current = false;

      stopStream(
        streamRef.current
      );

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }
    };
  }, [startCamera, stopStream]);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    retry: startCamera,
    startCamera,
    stopCamera,
  };
}