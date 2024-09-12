"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";

export default function Webcam({
  onComplete,
}: {
  onComplete: (image: string) => void;
}) {
  const camera = useRef<CameraType>(null);
  const [image, setImage] = useState<string | null>(null);

  return (
    <div>
      <Camera
        ref={camera}
        aspectRatio="cover"
        facingMode="user"
        errorMessages={{
          noCameraAccessible:
            "No camera device accessible. Please connect your camera or try a different browser.",
          permissionDenied:
            "Permission denied. Please refresh and give camera permission.",
          switchCamera:
            "It is not possible to switch camera to different one because there is only one video device accessible.",
          canvas: "Canvas is not supported.",
        }}
      />
      <div className="fixed bottom-4 z-10">
        <Button
          variant={"outline"}
          onClick={() => {
            if (camera.current) {
              const photo = camera.current.takePhoto();
              console.log(photo);
              setImage(photo as string);
              onComplete(photo as string);
            }
          }}
        >
          Take photo
        </Button>
      </div>
    </div>
  );
}
