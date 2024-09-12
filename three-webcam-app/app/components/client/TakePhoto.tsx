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
    console.log("lol");
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
    console.log("asdf");
    onNext();
  };

  return (
    <div className="space-y-6">
      {user.image ? (
        <Image src={user.image} width={500} height={500} alt="image" />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
          <Camera className="w-12 h-12 text-gray-400 mb-4" />

          <p className="text-sm text-gray-500">Your photo will appear here</p>
        </div>
      )}
      {user.image ? (
        <Button onClick={handleContinue} className="w-full">
          Continue
        </Button>
      ) : (
        <Button onClick={handleTakePhoto} className="w-full">
          Take a Photo
        </Button>
      )}

      {showCam && <Webcam onComplete={handleComplete} />}
    </div>
  );
}
