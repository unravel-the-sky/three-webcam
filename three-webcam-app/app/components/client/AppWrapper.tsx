"use client";

import { submitForm } from "@/app/serverActions/fileUpload";
import { deletePlayerById, jumpPlayerById } from "@/app/serverActions/player";
import useUserStore from "@/app/store/userStore";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import Confirm from "./Confirm";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";
import { CHANNEL_NAME } from "@/app/utils";
import { useChannel } from "ably/react";
import { ArrowBigLeft, ArrowBigRight, ArrowBigUp } from "lucide-react";

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

export type JumpDirection = "left" | "up" | "right";

export default function AppWrapper() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("");

  const userStore = useUserStore();
  const { user, setUser } = userStore;

  const handleNext = () => {
    setStep(step + 1);
  };

  const { publish } = useChannel(CHANNEL_NAME);
  const handleJumpPlayer = (direction: JumpDirection) => {
    publish("jump", { playerId: userId, direction });
  };

  useChannel(CHANNEL_NAME, "winner", (message) => {
    console.log("winner happened!");
    const { data } = message;
    const winnerId = data.playerId as string;
    if (winnerId === userId) {
      console.log("connngratulatu");
    }
  });

  const [cooldown, setCooldown] = useState(false);

  // useChannel(CHANNEL_NAME, "cooldown", (message) => {
  //   console.log("cooldown event!");
  //   const { data } = message;
  //   const cooldownId = data.playerId as string;
  //   if (cooldownId === userId) {
  //     console.log("cooldown bro");
  //     setTimeout(() => {
  //       setCooldown(false);
  //     }, 2000);
  //     setCooldown(true);
  //   }
  // });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUserId(userId);

    const username = localStorage.getItem("username");
    if (username) setUsername(username);

    const color = localStorage.getItem("userColor");
    if (color) setColor(`bg-[${color}] w-24 h-8`);
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
          localStorage.setItem("userColor", res.color);
          publish("newPlayer", { player: res });
        }
      });
    }
  };

  const handleReset = async () => {
    await deletePlayerById(userId);
    publish("deletePlayer", { playerId: userId });
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userColor");
    setUserId("");
    setUsername("");
    setColor("");
    setUser({
      color: "",
      username: "",
      image: "",
    });
  };

  return (
    <div className="flex items-center justify-center flex-col gap-2 overflow-y-hidden">
      {userId ? (
        <div className=" flex flex-col gap-4 items-center relative">
          <h4>hey {username}</h4>
          <div className={color}></div>
          {cooldown && (
            <p className="animate-ping duration-1000 text-sm absolute top-16">
              cooldown pls!
            </p>
          )}
          <div className="mt-12 flex gap-4">
            <div>
              <div className="text-sm">jump left</div>
              <Button
                variant={"blue"}
                onClick={() => handleJumpPlayer("left")}
                className="shadow-lg text-lg w-fit"
                disabled={cooldown}
              >
                <ArrowBigLeft className="rotate-45" />
              </Button>
            </div>
            <div className="mt-[-1rem]">
              <div className="text-sm">jump up</div>
              <Button
                variant={"blue"}
                onClick={() => handleJumpPlayer("up")}
                className="shadow-lg text-lg w-fit"
                disabled={cooldown}
              >
                <ArrowBigUp />
              </Button>
            </div>
            <div>
              <div className="text-sm">jump right</div>
              <Button
                variant={"blue"}
                onClick={() => handleJumpPlayer("right")}
                className="shadow-lg text-lg w-fit"
                disabled={cooldown}
              >
                <ArrowBigRight className="rotate-[-45deg]" />
              </Button>
            </div>
          </div>
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
