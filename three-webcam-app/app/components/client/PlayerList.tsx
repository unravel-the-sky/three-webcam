"use client";

import { getAllPlayers, pollAllPlayers } from "@/app/serverActions/player";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ShowTime from "./ShowTime";

export default function PlayerList() {
  const [isPolling, setIsPolling] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    getAllPlayers().then((res) => {
      if (res) {
        setPlayers(res);
      }
    });
  }, []);

  useEffect(() => {
    let interval = undefined;

    // new Date(players[players.length - 1][0].createdAt).getTime()

    if (isPolling) {
      interval = setInterval(async () => {
        // setPlayers([...players, ...[players[0]]]);

        const lastFetchTime = new Date(
          players[players.length - 1].createdAt
        ).getTime();
        const res = await pollAllPlayers(lastFetchTime);

        if (res && res.length > 0) {
          // new player is added
          console.log("new player: ", res);
          setPlayers((players) => [...players, ...res]);
        }
        console.log("im polling!");
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

  const handleClick = () => {
    const temp = [...players, ...[players[0]]];
    setPlayers(temp);
  };

  return (
    <>
      {showTime && (
        <div className="fixed w-full left-0 top-0 h-full bg-gray-600 p-4">
          <ShowTime imgList={players.map((player) => player.image)} />
          <Button variant={"default"} onClick={handleClick}>
            add new
          </Button>
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
            <p className="animate-ping duration-2000 text-sm">piu</p>
          )}
          {showTime && (
            <Button onClick={handleShowTime} className="w-fit">
              stop the show
            </Button>
          )}
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
                  <Image
                    src={new URL(player.image).toString()}
                    alt="img"
                    className="object-cover h-[100px] w-[150px]"
                    width={150}
                    height={100}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleShowTime} className="w-fit">
                Show time!
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
