"use client";

import { useState, useTransition } from "react";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";
import useUserStore from "@/app/store/userStore";
import { Button } from "@/components/ui/button";
import Confirm from "./Confirm";
import { submitForm } from "@/app/serverActions/fileUpload";
import Image from "next/image";

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

  const [isPending, startTransition] = useTransition();

  const handleUpload = async () => {
    if (user.image) {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("color", user.color);

      const imageAsFile = dataURIToBlob(user.image);
      formData.append("image", imageAsFile);

      startTransition(async () => {
        const res = await submitForm(formData);
        if (res) {
          alert("success!");
        }
      });
    }
  };

  // const imageSrc = new URL(imageUrl).toString();

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      {/* <div>
        hi mom
        <Image
          src={imageSrc}
          alt="img"
          className="object-cover h-full"
          width={150}
          height={100}
        />
      </div> */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full">
        {isPending ? (
          <div>loading..</div>
        ) : (
          <>
            {user && user.username && (
              <h1 className="text-2xl font-bold mb-6 text-center">
                Hey, {user.username}
              </h1>
            )}

            {step === 1 && <SplashScreen onNext={handleNext} />}
            {step === 2 && <TakePhoto onNext={handleNext} />}
            {step === 3 && <Confirm onConfirm={handleUpload} />}
          </>
        )}
      </div>
    </div>
  );
}
