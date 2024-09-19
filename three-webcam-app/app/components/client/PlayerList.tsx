"use client";

import {
  deleteAllPlayers,
  getAllPlayers,
  getRandomPlayers,
} from "@/app/serverActions/player";
import { CHANNEL_NAME } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import { useChannel } from "ably/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ShowTime from "./ShowTime";
import { JumpDirection } from "./AppWrapper";
import usePlayerStore from "@/app/store/playerStore";
import ShowTimeNew from "./ShowTimeNew";
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

export default function PlayerList() {
  const [isPolling, setIsPolling] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const [showTime, setShowTime] = useState(false);
  const [startGame, setStartGame] = useState(false);

  useEffect(() => {
    getAllPlayers().then((res) => {
      if (res) {
        setPlayers(res);
      }
    });
  }, []);

  const addRandos = () => {
    getRandomPlayers(50).then((res) => {
      if (res) {
        setPlayers((players) => [...players, ...res]);
      }
    });
  };

  const removeRandos = () => {
    setPlayers((players) =>
      players.filter((player) => !player.username.includes("Random"))
    );
  };

  useChannel(CHANNEL_NAME, "newPlayer", (message) => {
    const { data } = message;
    const player = data.player as Player;
    setPlayers((players) => [...players, player]);
  });

  useChannel(CHANNEL_NAME, "deletePlayer", (message) => {
    const { data } = message;
    const playerId = data.playerId as string;
    setPlayers((players) => players.filter((item) => item.id !== playerId));
  });

  const { setData } = usePlayerStore();

  const { channel } = useChannel(CHANNEL_NAME, "jump", (message) => {
    const { data: jumpData } = message;
    const { playerId } = jumpData;
    const direction = jumpData.direction as JumpDirection;
    setData({ jumpingPlayerId: playerId, direction });
  });

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handleShowTime = () => {
    setShowTime(!showTime);
  };

  const handleDeleteAll = async () => {
    // todo
    await deleteAllPlayers();
    getAllPlayers().then((res) => {
      if (res) {
        setPlayers(res);
      }
    });
  };

  const toggleStartGame = () => {
    setStartGame(!startGame);
  };

  return (
    <>
      {showTime && (
        <div className="fixed w-full left-0 top-0 h-full bg-gray-600 p-4 z-10">
          <ShowTime players={players} isGameOn={startGame} />
          {/* <ShowTimeNew players={players} isGameOn={startGame} /> */}
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        <div className="flex gap-4 z-10">
          <Button onClick={addRandos} className="w-fit">
            add randos
          </Button>
          <Button onClick={removeRandos} className="w-fit">
            remove randos
          </Button>

          {showTime && (
            <div className="fixed flex justify-start bottom-8 z-20 gap-4">
              <Button
                onClick={toggleStartGame}
                variant={"orange"}
                className="w-fit"
              >
                {startGame ? "stop game" : "start game"}
              </Button>
              <Button onClick={handleShowTime} className="w-fit">
                stop the show
              </Button>
            </div>
          )}
          <div className="fixed flex flex-col items-end justify-end pr-10 right-0 bottom-8">
            <Image
              src="/qr-code.png"
              width={200}
              height={200}
              alt={"QR code"}
            />
          </div>
        </div>

        {players && players.length > 0 && (
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div>num players: {players.length}</div>
            <div className="flex flex-wrap gap-4">
              {players.map((player, index) => (
                <PlayerPicture player={player} key={player.id} />
              ))}
              <div className="mt-4 flex w-full gap-4">
                <Button onClick={handleShowTime} className="w-fit">
                  show time!
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"destructive"} className="w-fit">
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
                      <AlertDialogAction
                        className="bg-[#1b3b64]"
                        onClick={handleDeleteAll}
                      >
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

const PlayerPicture = ({ player }: { player: Player }) => {
  const { data } = usePlayerStore();
  const [jump, setJump] = useState(false);

  useEffect(() => {
    if (data.jumpingPlayerId === player.id) {
      setJump(true);
      setTimeout(() => {
        setJump(false);
      }, 200);
    }
  }, [data]);

  return (
    <div
      key={player.id}
      className={`flex flex-col p-2 outline-dashed hover:bg-gray-200 hover:-translate-y-2 hover:shadow-lg transition-all ${
        jump && "-translate-y-2"
      }`}
    >
      <p className="text-sm">username: {player.username}</p>
      {player.image ? (
        <Image
          src={new URL(player.image).toString()}
          alt="img"
          className="object-cover h-[100px] w-[150px]"
          width={150}
          height={100}
        />
      ) : (
        <Image
          src={"/bugsbunny-square-1.png"}
          alt="img"
          className="object-cover h-[100px] w-[150px]"
          width={150}
          height={100}
        />
      )}
    </div>
  );
};
