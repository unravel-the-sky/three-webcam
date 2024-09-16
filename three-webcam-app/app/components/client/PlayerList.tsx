"use client";

import {
  deleteAllPlayers,
  getAllPlayers,
  getRandomPlayers,
  pollAllPlayers,
} from "@/app/serverActions/player";
import { Button } from "@/components/ui/button";
import { Jump, Player } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ShowTime from "./ShowTime";

export default function PlayerList() {
  const [isPolling, setIsPolling] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [jumpers, setJumpers] = useState<Jump[]>([]);

  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    getAllPlayers().then((res) => {
      if (res) {
        setPlayers(res);
      }
    });
  }, []);

  const startWithRandom = () => {
    getRandomPlayers(100).then((res) => {
      if (res) {
        setPlayers(res);
      }
    });
  };

  useEffect(() => {
    let interval = undefined;

    if (isPolling) {
      interval = setInterval(async () => {
        const lastFetchTime =
          players.length > 0
            ? new Date(players[players.length - 1].createdAt).getTime()
            : new Date(172161082181).getTime();

        const res = await pollAllPlayers(lastFetchTime);
        if (res && res.length > 0) {
          // new player is added
          setPlayers((players) => [...players, ...res]);
        }

        console.log("im polling players!");
      }, 1000); // Poll every 1 second
    }

    // Cleanup the interval when component unmounts or polling stops
    return () => {
      clearInterval(interval);
    };
  }, [isPolling, players]);

  const buttonText = isPolling ? "stop polling" : "start polling";

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handleShowTime = () => {
    setShowTime(!showTime);
  };

  const handleDeleteAll = () => {
    // todo
    deleteAllPlayers();
  };

  return (
    <>
      {showTime && (
        <div className="fixed w-full left-0 top-0 h-full bg-gray-600 p-4">
          <ShowTime players={players} />
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        <div className="flex gap-4 z-10">
          <Button
            variant={isPolling ? "orange" : "default"}
            onClick={togglePolling}
            className="w-fit"
          >
            {buttonText}
          </Button>

          {isPolling && (
            <p className="animate-ping duration-1000 text-sm">piu</p>
          )}

          <Button onClick={startWithRandom} className="w-fit">
            start with random
          </Button>

          {showTime && (
            <div className="fixed flex justify-start w-full bottom-8 z-20">
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
                <div
                  key={player.id}
                  className="flex flex-col p-2 outline-dashed hover:bg-gray-200 hover:shadow-lg transition-all"
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
              ))}
              <div className="mt-4 flex w-full gap-4">
                <Button onClick={handleShowTime} className="w-fit">
                  show time!
                </Button>
                <Button
                  onClick={handleDeleteAll}
                  variant={"destructive"}
                  className="w-fit"
                >
                  delete all
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
