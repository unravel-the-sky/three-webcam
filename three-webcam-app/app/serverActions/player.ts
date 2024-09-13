'use server'

import { getAllPlayersInDb } from "@/prisma/databaseActions"

export const getAllPlayers = async () => {
    const res = await getAllPlayersInDb();
    return res;
}