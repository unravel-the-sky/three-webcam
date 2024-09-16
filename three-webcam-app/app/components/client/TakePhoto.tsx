"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import Webcam from "./Webcam";
import useUserStore from "@/app/store/userStore";
import Image from "next/image";

export default function TakePhoto({ onNext }: { onNext: () => void }) {
  const [showCam, setShowCam] = useState(false);
  const handleTakePhoto = () => {
    setShowCam(true);
  };

  const userStore = useUserStore();
  const { user, setUser } = userStore;

  const handleComplete = (image: string) => {
    setUser({
      color: user.color,
      username: user.username,
      image,
    });
    setShowCam(false);
  };

  const handleContinue = () => {
    onNext();
  };

  const handleRetake = () => {
    setShowCam(true);
  };

  return (
    <div className="flex w-full justify-center">
      {showCam ? (
        <Webcam onComplete={handleComplete} />
      ) : (
        <div className="flex flex-col gap-4 w-[80%]">
          {user.image ? (
            <div className="flex w-full justify-center items-center">
              <Image
                className="h-[100%] object-contain"
                src={user.image}
                width={500}
                height={500}
                alt="image"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400 mb-4" />

              <p className="text-sm text-gray-500">
                Your photo will appear here
              </p>
            </div>
          )}
          {user.image ? (
            <div className="flex justify-between w-full gap-4">
              <Button variant={"destructive"} onClick={handleRetake}>
                Retake
              </Button>
              <Button variant={"default"} onClick={handleContinue}>
                OK?
              </Button>
            </div>
          ) : (
            <Button onClick={handleTakePhoto} className="w-full">
              Take a Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
