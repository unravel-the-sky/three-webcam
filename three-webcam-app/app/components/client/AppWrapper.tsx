"use client";

import { submitForm } from "@/app/serverActions/fileUpload";
import { deletePlayerById } from "@/app/serverActions/player";
import { setLocalPlayer, useLocalPlayer } from "@/app/store/localPlayer";
import useUserStore from "@/app/store/userStore";
import { CHANNEL_NAME } from "@/app/utils";
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
import { Button } from "@/components/ui/button";
import { useChannel } from "ably/react";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Bomb,
} from "lucide-react";
import { useState, useTransition } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import SplashScreen from "./SplashScreen";
import TakePhoto from "./TakePhoto";

export type JumpDirection = "left" | "up" | "right" | "down" | "jump";

const dataURIToBlob = (dataURI: string) => {
  const [header, data] = dataURI.split(",");
  const byteString = header.includes("base64") ? atob(data) : decodeURI(data);
  const mimeString = header.split(":")[1].split(";")[0];

  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);

  return new Blob([bytes], { type: mimeString });
};

/**
 * The phone side of the demo: sign up (name, colour, selfie), then a d-pad
 * that publishes moves for this player's ball over Ably.
 */
export default function AppWrapper() {
  const [step, setStep] = useState(1);
  const [isCooldown, setIsCooldown] = useState(false);
  const [winner, setWinner] = useState(false);
  const [isPending, startTransition] = useTransition();

  // undefined until hydrated, null when this phone hasn't signed up yet
  const player = useLocalPlayer();
  const userId = player?.id ?? "";

  const { user, setUser } = useUserStore();

  const { publish } = useChannel(CHANNEL_NAME);

  useChannel(CHANNEL_NAME, "winner", (message) => {
    if (message.data.playerId === userId) setWinner(true);
  });

  // The admin freezes the controls while the show is on but the game hasn't started.
  useChannel(CHANNEL_NAME, "isGameOn", (message) => {
    setIsCooldown(Boolean(message.data.val));
  });

  const handleMove = (direction: JumpDirection) => {
    publish("jump", { playerId: userId, direction });
  };

  const handleUpload = () => {
    if (!user.image) return;

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("color", user.color);
    formData.append("image", dataURIToBlob(user.image));

    startTransition(async () => {
      const created = await submitForm(formData);
      publish("newPlayer", { player: created });
      setLocalPlayer({ id: created.id, username: created.username, color: created.color });
      setStep(1);
    });
  };

  const handleRespawn = () => {
    publish("respawn", { playerId: userId });
  };

  const handleReset = async () => {
    try {
      await deletePlayerById(userId);
    } catch (err) {
      console.error("[deletePlayer]", err);
    } finally {
      publish("deletePlayer", { playerId: userId });
      setLocalPlayer(null);
      setUser({ color: "", username: "", image: "" });
    }
  };

  if (player === undefined) return <div>loading..</div>;

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 overflow-y-hidden">
        <div className="w-full rounded-lg bg-white p-8 shadow-lg">
          {isPending ? (
            <div>loading..</div>
          ) : (
            <>
              {step === 1 && <SplashScreen onNext={() => setStep(2)} />}
              {step === 2 && <TakePhoto onNext={handleUpload} />}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4">
      <h4>hey {player.username}</h4>
      <div className="h-8 w-24 rounded" style={{ backgroundColor: player.color }} />

      <div className="mt-12 flex flex-col gap-4">
        {winner && (
          <>
            <div className="fixed top-2 flex w-full animate-bounce justify-center">
              WELLDONE!!
            </div>
            <ConfettiExplosion onComplete={() => setWinner(false)} />
          </>
        )}
        <div className="flex w-full justify-center">
          <PlayerButton direction="up" onMove={handleMove} disabled={isCooldown} />
        </div>
        <div className="flex items-center gap-4">
          <PlayerButton direction="left" onMove={handleMove} disabled={isCooldown} />
          <PlayerButton direction="jump" onMove={handleMove} disabled={isCooldown} />
          <PlayerButton direction="right" onMove={handleMove} disabled={isCooldown} />
        </div>
        <div className="flex w-full justify-center">
          <PlayerButton direction="down" onMove={handleMove} disabled={isCooldown} />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-16">
        <Button
          onClick={handleRespawn}
          className="select-none px-4 py-4 text-lg shadow-lg"
          disabled={isCooldown}
        >
          respawn!
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="px-4 py-4 text-lg shadow-lg">
              delete player!
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>omg fr?</AlertDialogTitle>
              <AlertDialogDescription>this will delete your user</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>nah</AlertDialogCancel>
              <AlertDialogAction className="bg-[#1b3b64]" onClick={handleReset}>
                yez
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const icons: Record<JumpDirection, React.ReactNode> = {
  left: <ArrowBigLeft size={40} />,
  right: <ArrowBigRight size={40} />,
  up: <ArrowBigUp size={40} />,
  down: <ArrowBigDown size={40} />,
  jump: <Bomb size={40} />,
};

const PlayerButton = ({
  direction,
  disabled,
  onMove,
}: {
  direction: JumpDirection;
  disabled: boolean;
  onMove: (direction: JumpDirection) => void;
}) => (
  <Button
    variant="blue"
    onClick={() => onMove(direction)}
    className="h-fit w-fit rounded-full text-lg shadow-lg"
    disabled={disabled}
    aria-label={direction}
  >
    {icons[direction]}
  </Button>
);
