'use server'

import { getAllJumpingPlayersInDb, getAllPlayersInDb, pollAllPlayersInDb, updatePlayerInDbById } from "@/prisma/databaseActions"
import { Player } from "@prisma/client";
import { cookies } from "next/headers";

export const getAllPlayers = async () => {
    const res = await getAllPlayersInDb();
    return res
}

export const pollAllPlayers = async (lastFetchDate: number) => {
    const res = await pollAllPlayersInDb(lastFetchDate)
    if (res) return res;
}

export const jumpPlayerById = async (id: string, state: boolean) => {
    const res = await updatePlayerInDbById(id, state)
    return res;
}

export const getJumpingPlayers = async () => {
    const res = await getAllJumpingPlayersInDb()
    return res;
}