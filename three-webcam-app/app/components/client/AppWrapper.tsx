"use client";

import { useEffect, useState, useTransition } from "react";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";
import useUserStore from "@/app/store/userStore";
import { Button } from "@/components/ui/button";
import Confirm from "./Confirm";
import { submitForm } from "@/app/serverActions/fileUpload";
import Image from "next/image";
import { Player } from "@prisma/client";
import { jumpPlayerById } from "@/app/serverActions/player";

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
  const [userId, setUserId] = useState("");

  const userStore = useUserStore();
  const { user } = userStore;

  const handleNext = () => {
    setStep(step + 1);
  };

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const val = localStorage.getItem("userId");
    if (val) {
      setUserId(val);
    }
  }, []);

  const handleUpload = async () => {
    if (user.image) {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("color", user.color);

      const imageAsFile = dataURIToBlob(user.image);
      formData.append("image", imageAsFile);

      startTransition(async () => {
        const res = (await submitForm(formData)) as Player | undefined;
        if (res) {
          localStorage.set("userId", res.id);
          alert("success!");
        }
      });
    }
  };

  const handleJumpPlayer = () => {
    // lets try
    const id = localStorage.getItem("userId");
    if (id) {
      setTimeout(() => {
        jumpPlayerById(id, false);
      }, 500);
      jumpPlayerById(id, true);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col gap-2 overflow-y-hidden">
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
      {userId && (
        <div className="mt-12">
          <Button
            variant={"blue"}
            onClick={handleJumpPlayer}
            className="rounded-[50%] px-4 py-10 shadow-lg text-lg"
          >
            Jump
          </Button>
        </div>
      )}
    </div>
  );
}
