'use server'

import { deleteAllPlayersInDb, deletePlayerByIdInDb, getAllJumpingPlayersInDb, getAllPlayersInDb, pollAllPlayersInDb, updatePlayerInDbById } from "@/prisma/databaseActions";
import { Player } from "@prisma/client";
import colors from "nice-color-palettes";

export const getAllPlayers = async () => {
    const res = await getAllPlayersInDb();
    return res
}

export const getRandomPlayers = async (count: number) => {
    const randomPlayers: Player[] = Array(count)
        .fill(true)
        .map((item, index) => (
            {
                color: colors[Math.round(Math.random() * 50)][1],
                id: (Math.random() * 100).toString(),
                image: '',
                username: `Random ${index}`,
                createdAt: new Date(Date.now()),
                isOnline: false
            }
        ))

    return randomPlayers
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
export const deleteAllPlayers = async () => {
    const res = await deleteAllPlayersInDb()
    return res;
}
export const deletePlayerById = async (id: string) => {
    const res = await deletePlayerByIdInDb(id)
    return res;
}