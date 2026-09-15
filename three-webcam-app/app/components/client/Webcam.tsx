"use client";

import { Button } from "@/components/ui/button";
import { Camera, SwitchCamera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type FacingMode = "user" | "environment";

/** Longest side of the captured photo; the ball texture doesn't need more. */
const MAX_PHOTO_SIZE = 640;

const errorMessage = (err: unknown) => {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError")
    return "Permission denied. Please refresh and allow camera access.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera found. Please connect a camera or try another browser.";
  return "Could not start the camera.";
};

/**
 * Minimal webcam capture built on `getUserMedia`: live preview, take photo, flip camera.
 * Calls `onComplete` with a JPEG data URL.
 */
export default function Webcam({
  onComplete,
}: {
  onComplete: (image: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [canSwitch, setCanSwitch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const devices = await navigator.mediaDevices.enumerateDevices();
        setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    };

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facingMode, stopStream]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the front camera so the photo matches the preview.
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    onComplete(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
        />
        {error && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-base text-white">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-5">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={takePhoto}
          disabled={!!error}
          aria-label="Take photo"
        >
          <Camera />
        </Button>
        {canSwitch && (
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => setFacingMode((m) => (m === "user" ? "environment" : "user"))}
            aria-label="Switch camera"
          >
            <SwitchCamera />
          </Button>
        )}
      </div>
    </div>
  );
}
