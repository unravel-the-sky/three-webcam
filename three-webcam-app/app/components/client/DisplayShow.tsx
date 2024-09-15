"use client";

import { getAllPlayers, pollAllPlayers } from "@/app/serverActions/player";
import { Player } from "@prisma/client";
import { useState, useEffect } from "react";
import ShowTime from "./ShowTime";

export default function DisplayShow() {
  const [players, setPlayers] = useState<Player[]>([]);

  const [showTime, setShowTime] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const isPolling = false;

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
        // setPlayers([...players, ...[players[0]]]);

        const lastFetchTime =
          players.length > 0
            ? new Date(players[players.length - 1].createdAt).getTime()
            : new Date(172161082181).getTime();

        // const lastFetchTime = new Date(1726400834660).getTime();

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
  }, [currentTime, isPolling, players]);

  return <ShowTime />;
}
