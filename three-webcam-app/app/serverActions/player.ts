'use server'

import { getAllPlayersInDb, pollAllPlayersInDb } from "@/prisma/databaseActions"
import { Player } from "@prisma/client";

export const getAllPlayers = async () => {
    const res = await getAllPlayersInDb();
    return res;
}

export const pollAllPlayers = async (lastFetchDate: number) => {
    const res = await pollAllPlayersInDb(lastFetchDate)
    // const res = await getAllPlayersInDb()
    // if (res) {
    //     const temp: Player = {
    //         color: res[0].color,
    //         id: res[0].id,
    //         createdAt: res[0].createdAt,
    //         image: res[0].image,
    //         isOnline: res[0].isOnline,
    //         username: res[0].username,
    //     }
    //     return [temp]
    // }
    return res;
}