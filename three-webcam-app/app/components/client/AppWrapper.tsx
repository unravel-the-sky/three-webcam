"use client";

import { submitForm } from "@/app/serverActions/fileUpload";
import { deletePlayerById } from "@/app/serverActions/player";
import useUserStore from "@/app/store/userStore";
import { CHANNEL_NAME } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import { useChannel } from "ably/react";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Bomb,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const maxJumps = 100;
const cooldownTime = 2000;

export type JumpDirection = "left" | "up" | "right" | "down" | "jump";

export default function AppWrapper() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);

  const [jumpCount, setJumpCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  const userStore = useUserStore();
  const { user, setUser } = userStore;

  const handleNext = () => {
    setStep(step + 1);
  };

  const { publish } = useChannel(CHANNEL_NAME);
  const handleJumpPlayer = (direction: JumpDirection) => {
    if (isCooldown || (direction === "jump" && jumpCount >= maxJumps)) {
      console.log("sorry bro cooldown a bit");
      setIsCooldown(true);
      return;
    }

    // Increment jump count
    direction === "jump" && setJumpCount(jumpCount + 1);

    // If maximum jump count is reached, trigger cooldown
    if (jumpCount + 1 >= maxJumps && direction === "jump") {
      setIsCooldown(true);
      setTimeout(() => {
        setJumpCount(0); // Reset jump count after cooldown
        setIsCooldown(false);
      }, cooldownTime);
    }
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

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);

    const userId = localStorage.getItem("userId");
    if (userId) setUserId(userId);

    const username = localStorage.getItem("username");
    if (username) setUsername(username);

    const color = localStorage.getItem("userColor");
    if (color) setColor(`bg-[${color}] w-24 h-8`);

    setLoading(false);
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

  if (loading) return <div>loading..</div>;

  return (
    <div className="flex items-center justify-center flex-col gap-2 overflow-y-hidden">
      {userId ? (
        <div className=" flex flex-col gap-4 items-center relative">
          <h4>hey {username}</h4>
          <div className={color}></div>
          {isCooldown && (
            <p className="animate-ping duration-1000 text-sm absolute top-16">
              Cooldown pls!
            </p>
          )}
          <div className="mt-12 flex flex-col gap-4">
            <div className="flex w-full justify-center">
              <PlayerButton
                direction="up"
                onJumpPlayer={handleJumpPlayer}
                isCooldown={isCooldown}
              />
            </div>
            <div className="flex gap-4 items-center">
              <PlayerButton
                direction="left"
                onJumpPlayer={handleJumpPlayer}
                isCooldown={isCooldown}
              />
              <PlayerButton
                direction="jump"
                onJumpPlayer={handleJumpPlayer}
                isCooldown={isCooldown}
              />
              <PlayerButton
                direction="right"
                onJumpPlayer={handleJumpPlayer}
                isCooldown={isCooldown}
              />
            </div>
            <div className="flex w-full justify-center">
              <PlayerButton
                direction="down"
                onJumpPlayer={handleJumpPlayer}
                isCooldown={isCooldown}
              />
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={"destructive"}
                className="mt-12 px-4 py-4 shadow-lg text-lg"
              >
                reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>omg fr?</AlertDialogTitle>
                <AlertDialogDescription>
                  this will delete your user
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>nah</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#1b3b64]"
                  onClick={handleReset}
                >
                  yez
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full">
          {isPending ? (
            <div>loading..</div>
          ) : (
            <>
              {step === 1 && <SplashScreen onNext={handleNext} />}
              {step === 2 && <TakePhoto onNext={handleUpload} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const PlayerButton = ({
  direction,
  isCooldown,
  onJumpPlayer,
}: {
  direction: JumpDirection;
  isCooldown: boolean;
  onJumpPlayer: (direction: JumpDirection) => void;
}) => {
  return (
    <div>
      {/* <div className="text-sm">jump left</div> */}
      <Button
        variant={"blue"}
        onClick={() => onJumpPlayer(direction)}
        className="shadow-lg text-lg w-fit h-fit"
        disabled={isCooldown}
      >
        {direction === "left" && <ArrowBigLeft />}
        {direction === "right" && <ArrowBigRight />}
        {direction === "up" && <ArrowBigUp />}
        {direction === "down" && <ArrowBigDown />}
        {direction === "jump" && <Bomb size={40} />}
      </Button>
    </div>
  );
};
