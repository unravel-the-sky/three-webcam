"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Webcam from "./Webcam";
import useUserStore from "@/app/store/userStore";

export default function TakePhoto({ onNext }: { onNext: () => void }) {
  const [showCam, setShowCam] = useState(false);
  const { user, setUser } = useUserStore();

  const handleComplete = (image: string) => {
    setUser({ ...user, image });
    setShowCam(false);
  };

  if (showCam) return <Webcam onComplete={handleComplete} />;

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-[80%] flex-col gap-4">
        {user.image ? (
          <div className="flex w-full items-center justify-center">
            <Image
              className="h-full object-contain"
              src={user.image}
              width={500}
              height={500}
              alt="your selfie"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
            <Camera className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500">Your photo will appear here</p>
          </div>
        )}
        {user.image ? (
          <div className="flex w-full justify-between gap-4">
            <Button variant="destructive" onClick={() => setShowCam(true)}>
              Retake
            </Button>
            <Button onClick={onNext}>OK?</Button>
          </div>
        ) : (
          <Button onClick={() => setShowCam(true)} className="w-full">
            Take a Photo
          </Button>
        )}
      </div>
    </div>
  );
}
