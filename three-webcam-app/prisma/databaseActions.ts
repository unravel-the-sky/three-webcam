import prisma from "@/lib/prisma";
import { Prisma, type Player } from "@/lib/generated/prisma/client";

export type PlayerDto = {
  username: string;
  color: string;
  image: string;
};

const logPrismaError = (fn: string, err: unknown) => {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    console.error(`[${fn}]`, err.message);
  } else {
    console.error(`[${fn}]`, err);
  }
};

export const createPlayerInDb = async (payload: PlayerDto): Promise<Player> => {
  try {
    return await prisma.player.create({ data: payload });
  } catch (err) {
    logPrismaError("createPlayerInDb", err);
    throw new Error("Could not create player");
  }
};

export const getAllPlayersInDb = async (): Promise<Player[]> => {
  try {
    return await prisma.player.findMany({ orderBy: { createdAt: "asc" } });
  } catch (err) {
    logPrismaError("getAllPlayersInDb", err);
    return [];
  }
};

export const getPlayerByIdInDb = async (id: string): Promise<Player | null> => {
  try {
    return await prisma.player.findUnique({ where: { id } });
  } catch (err) {
    logPrismaError("getPlayerByIdInDb", err);
    return null;
  }
};

export const deleteAllPlayersInDb = async () => {
  try {
    return await prisma.player.deleteMany();
  } catch (err) {
    logPrismaError("deleteAllPlayersInDb", err);
  }
};

export const deletePlayerByIdInDb = async (id: string) => {
  try {
    return await prisma.player.deleteMany({ where: { id } });
  } catch (err) {
    logPrismaError("deletePlayerByIdInDb", err);
  }
};
