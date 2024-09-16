"use client";

import { submitForm } from "@/app/serverActions/fileUpload";
import { jumpPlayerById } from "@/app/serverActions/player";
import useUserStore from "@/app/store/userStore";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import Confirm from "./Confirm";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";

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
  const [username, setUsername] = useState("");

  const userStore = useUserStore();
  const { user, setUser } = userStore;

  const handleNext = () => {
    setStep(step + 1);
  };

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUserId(userId);

    const username = localStorage.getItem("username");
    if (username) setUsername(username);
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
          localStorage.setItem("userId", res.id);
          localStorage.setItem("username", res.username);
          alert("success!");
        }
      });
    }
  };

  const handleJumpPlayer = async () => {
    // lets try
    const id = localStorage.getItem("userId");
    if (id) {
      jumpPlayerById(id, true);
      // setTimeout(() => {
      //   jumpPlayerById(id, false);
      // }, 500);
      // jumpPlayerById(id, true);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUserId("");
    setUsername("");
    setUser({
      color: "",
      username: "",
      image: "",
    });
  };

  return (
    <div className="flex items-center justify-center flex-col gap-2 overflow-y-hidden">
      {userId ? (
        <div className="mt-12 flex flex-col gap-4 items-center">
          <h4>hey {username}</h4>
          <Button
            variant={"blue"}
            onClick={handleJumpPlayer}
            className="rounded-[50%] px-4 py-10 shadow-lg text-lg w-fit"
          >
            Jump
          </Button>
          <Button
            variant={"destructive"}
            onClick={handleReset}
            className="mt-12 px-4 py-4 shadow-lg text-lg"
          >
            Reset
          </Button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full">
          {isPending ? (
            <div>loading..</div>
          ) : (
            <>
              {step === 1 && <SplashScreen onNext={handleNext} />}
              {step === 2 && <TakePhoto onNext={handleNext} />}
              {step === 3 && <Confirm onConfirm={handleUpload} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
