"use client";

import { getAllPlayers } from "@/app/serverActions/player";
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

    if (isPolling) {
      interval = setInterval(async () => {
        const res = await getAllPlayers();
        if (res) {
          setPlayers(res);
        }
        console.log("im polling!");
      }, 1000); // Poll every 1 second
    }

    // Cleanup the interval when component unmounts or polling stops
    return () => {
      clearInterval(interval);
    };
  }, [isPolling]);

  const buttonText = isPolling ? "stop polling" : "start polling";

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handleShowTime = () => {
    setShowTime(!showTime);
  };

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex gap-4">
        <Button
          variant={isPolling ? "orange" : "default"}
          onClick={togglePolling}
          className="w-fit"
        >
          {buttonText}
        </Button>
        <p>piu</p>
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
          {showTime && (
            <ShowTime imgList={players.map((player) => player.image)} />
          )}
        </div>
      )}
    </div>
  );
}
