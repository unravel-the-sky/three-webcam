"use client";

import {
  getAllPlayers,
  getJumpingPlayers,
  pollAllPlayers,
} from "@/app/serverActions/player";
import usePlayerStore from "@/app/store/playerStore";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ShowTime from "./ShowTime";

export default function PlayerList() {
  const [isPolling, setIsPolling] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const [showTime, setShowTime] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const { setData, data } = usePlayerStore();

  useEffect(() => {
    getAllPlayers().then((res) => {
      if (res) {
        setPlayers(res);
        // const imgList = res.map((player) => player.image);
        // setData({ imgList });
      }
    });
  }, []);

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
          // const imgList = [...players, ...res].map((player) => player.image);
          // setData({ imgList });
        }

        const jumpers = await getJumpingPlayers();
        if (jumpers && jumpers.length > 0) {
          const jumpersIdList = jumpers.map((player) => player.id);
          setData({ imgList: jumpersIdList });
        }
        console.log("im polling!");
      }, 1000); // Poll every 1 second
    }

    // Cleanup the interval when component unmounts or polling stops
    return () => {
      clearInterval(interval);
    };
  }, [currentTime, isPolling, players, setData]);

  const buttonText = isPolling ? "stop polling" : "start polling";

  console.log("playerData: ", data);

  const togglePolling = () => {
    setCurrentTime(Date.now());
    setIsPolling(!isPolling);
  };

  const handleShowTime = () => {
    setShowTime(!showTime);
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

          {showTime && (
            <div className="fixed flex justify-end  pr-12 w-full bottom-8">
              <Button onClick={handleShowTime} className="w-fit">
                stop the show
              </Button>
            </div>
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
