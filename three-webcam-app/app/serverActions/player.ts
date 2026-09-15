"use server";

import {
  deleteAllPlayersInDb,
  deletePlayerByIdInDb,
  getAllPlayersInDb,
  getPlayerByIdInDb,
} from "@/prisma/databaseActions";
import type { Player } from "@/lib/generated/prisma/client";
import palettes from "nice-color-palettes";

export const getAllPlayers = async () => getAllPlayersInDb();

export const getPlayerById = async (playerId: string) => getPlayerByIdInDb(playerId);

export const deleteAllPlayers = async () => deleteAllPlayersInDb();

export const deletePlayerById = async (id: string) => deletePlayerByIdInDb(id);

/** Fake players (not persisted) for stress-testing the 3D scene from the admin panel. */
export const getRandomPlayers = async (count: number): Promise<Player[]> =>
  Array.from({ length: count }, (_, index) => ({
    id: `random-${crypto.randomUUID()}`,
    username: `Random ${index}`,
    color: palettes[Math.floor(Math.random() * 50)][1],
    image: "",
    createdAt: new Date(),
  }));
