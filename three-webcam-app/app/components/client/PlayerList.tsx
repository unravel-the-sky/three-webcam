"use client";

import {
  deleteAllPlayers,
  getAllPlayers,
  getPlayerById,
  getRandomPlayers,
} from "@/app/serverActions/player";
import usePlayerStore from "@/app/store/playerStore";
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
import type { Player } from "@/lib/generated/prisma/client";
import { useChannel } from "ably/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { JumpDirection } from "./AppWrapper";
import ShowTime from "./ShowTime";

/**
 * The big-screen side of the demo: a waiting room listing everyone who signed up,
 * and the "show time" 3D scene where their balls race up the platforms.
 */
export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showTime, setShowTime] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);

  const { setData } = usePlayerStore();
  const { publish } = useChannel(CHANNEL_NAME);

  useEffect(() => {
    getAllPlayers().then(setPlayers);
  }, []);

  useChannel(CHANNEL_NAME, "newPlayer", (message) => {
    const player = message.data.player as Player;
    setPlayers((players) => [...players, player]);
  });

  useChannel(CHANNEL_NAME, "deletePlayer", (message) => {
    const playerId = message.data.playerId as string;
    setPlayers((players) => players.filter((item) => item.id !== playerId));
  });

  useChannel(CHANNEL_NAME, "jump", (message) => {
    const { playerId, direction } = message.data as {
      playerId: string;
      direction: JumpDirection;
    };
    setData({ jumpingPlayerId: playerId, direction });
  });

  useChannel(CHANNEL_NAME, "winner", async (message) => {
    const player = await getPlayerById(message.data.playerId as string);
    if (!player) return;
    setWinners((list) =>
      list.includes(player.username) ? list : [...list, player.username],
    );
  });

  // Freeze the phone controls while the show is on but the game hasn't started.
  const controlsLocked = showTime && !startGame;
  useEffect(() => {
    publish("isGameOn", { val: controlsLocked });
  }, [controlsLocked, publish]);

  const addRandos = async () => {
    const randos = await getRandomPlayers(50);
    setPlayers((players) => [...players, ...randos]);
  };

  const removeRandos = () => {
    setPlayers((players) => players.filter((p) => !p.id.startsWith("random-")));
  };

  const handleDeleteAll = async () => {
    await deleteAllPlayers();
    setPlayers(await getAllPlayers());
  };

  return (
    <>
      {showTime && (
        <div className="fixed left-0 top-0 z-10 h-full w-full bg-gray-600 p-4">
          <ShowTime players={players} isGameOn={startGame} />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4">
        <div className="z-10 flex gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <Button onClick={addRandos} className="w-fit">
                add randos
              </Button>
              <Button onClick={removeRandos} className="w-fit">
                remove randos
              </Button>
            </div>
            {showTime &&
              winners.map((winner) => (
                <div key={winner} className="text-sm">
                  {winner} has made it!!
                </div>
              ))}
          </div>

          {showTime && (
            <div className="fixed bottom-8 z-20 flex justify-start gap-4">
              <Button onClick={() => setStartGame((v) => !v)} variant="orange" className="w-fit">
                {startGame ? "stop game" : "start game"}
              </Button>
              <Button onClick={() => setShowTime(false)} className="w-fit">
                stop the show
              </Button>
            </div>
          )}
          <div className="fixed bottom-8 right-0 flex flex-col items-end justify-end pr-10">
            <Image src="/qr-code.png" width={200} height={200} alt="QR code to join" priority />
          </div>
        </div>

        {players.length > 0 && (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div>num players: {players.length}</div>
            <div className="flex flex-wrap gap-4">
              {players.map((player) => (
                <PlayerPicture player={player} key={player.id} />
              ))}
              <div className="mt-4 flex w-full gap-4">
                <Button onClick={() => setShowTime(true)} className="w-fit">
                  show time!
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-fit">
                      delete all
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>omg fr?</AlertDialogTitle>
                      <AlertDialogDescription>
                        this will wipe out all the users from db!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>nah</AlertDialogCancel>
                      <AlertDialogAction className="bg-[#1b3b64]" onClick={handleDeleteAll}>
                        yez
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const nudgeClass: Record<JumpDirection, string> = {
  left: "-translate-x-2",
  right: "translate-x-2",
  up: "-translate-y-2",
  down: "translate-y-2",
  jump: "scale-110",
};

/** A player card in the waiting room; nudges in the direction of their latest move. */
const PlayerPicture = ({ player }: { player: Player }) => {
  const [jump, setJump] = useState<JumpDirection>();

  // Subscribe directly so only the card that moved re-renders.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = usePlayerStore.subscribe(({ data }) => {
      if (data.jumpingPlayerId !== player.id) return;
      setJump(data.direction);
      clearTimeout(timeout);
      timeout = setTimeout(() => setJump(undefined), 200);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [player.id]);

  return (
    <div
      className={`flex flex-col p-2 outline-dashed transition-all hover:-translate-y-2 hover:bg-gray-200 hover:shadow-lg ${
        jump ? nudgeClass[jump] : ""
      }`}
    >
      <p className="text-sm">username: {player.username}</p>
      {/* Selfies are already small (<=640px JPEG) and served straight from S3, so skip
          Next's image optimizer: nothing to gain, and its SSRF guard rejects S3 hosts on
          DNS64/NAT64 networks. */}
      <Image
        src={player.image || "/bugsbunny-square-1.png"}
        alt={player.username}
        className="h-[100px] w-[150px] object-cover"
        width={150}
        height={100}
        unoptimized
      />
    </div>
  );
};
