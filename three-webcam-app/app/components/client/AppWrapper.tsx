"use client";

import { useState } from "react";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";
import useUserStore from "@/app/store/userStore";
import { Button } from "@/components/ui/button";
import Confirm from "./Confirm";
import { submitForm } from "@/app/serverActions/fileUpload";

const dataURIToBlob = (dataURI: string) => {
  const splitDataURI = dataURI.split(",");
  const byteString =
    splitDataURI[0].indexOf("base64") >= 0
      ? atob(splitDataURI[1])
      : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return new Blob([ia], { type: mimeString });
};

export default function AppWrapper() {
  const [step, setStep] = useState(1);

  const userStore = useUserStore();
  const { user } = userStore;

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleUpload = async () => {
    if (user.image) {
      // const imageAsFile = new Image(500, 500);
      // imageAsFile.src = user.image;

      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("color", user.color);

      const imageAsFile = dataURIToBlob(user.image);
      formData.append("image", imageAsFile);

      await submitForm(formData);
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {user && user.username && (
          <h1 className="text-2xl font-bold mb-6 text-center">
            Hey, {user.username}
          </h1>
        )}

        {step === 1 && <SplashScreen onNext={handleNext} />}
        {step === 2 && <TakePhoto onNext={handleNext} />}
        {step === 3 && <Confirm onConfirm={handleUpload} />}
      </div>
    </div>
  );
}
