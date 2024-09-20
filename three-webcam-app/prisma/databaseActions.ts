import { Jump, Player, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export type PlayerDto = {
    username: string,
    color: string,
    image: string
}

export const createPlayerInDb = async (payload: PlayerDto): Promise<Player | undefined> => {
    const {username, color, image} = payload
    try {
        const res = await prisma.player.create({
            data: {
                username,
                color,
                image
            }
        })
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in createPostInDb: ', err.message)
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            console.error('error happened in createPostInDb: ', err.message)
        }
        throw new Error('poop happened')
    }
}

export const getAllPlayersInDb = async (): Promise<Player[] | undefined> => {
    try {
        const res = await prisma.player.findMany({
            orderBy: {
                createdAt: 'asc'
            },
        })
        return res;
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const getPlayerByIdInDb = async (playerId: string): Promise<Player | null | undefined> => {
    try {
        const res = await prisma.player.findFirst({
            where: {
                id: playerId
            }
        })
        return res;
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const pollAllPlayersInDb = async (lastPollingDate: number) => {
    try {
        const res = await prisma.player.findMany({
            where: {
                createdAt: {
                    gt: new Date(lastPollingDate)
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const getAllJumpingPlayersInDb = async (): Promise<Player[] | undefined> => {
    try {
        const res = await prisma.player.findMany({
            where: {
                isOnline: true
            },
            orderBy: {
                createdAt: 'asc'
            },
        })
        return res;
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const updatePlayerInDbById = async (id: string, state: boolean) => {
    try {
        const res = await prisma.player.update({
            where: {
                id
            },
            data: {
                isOnline: state
            }
        })
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const deleteAllPlayersInDb = async () => {
    try {
        const res = await prisma.player.deleteMany()
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export const deletePlayerByIdInDb = async (id: string) => {
    try {
        const res = await prisma.player.deleteMany(
            {
                where: {
                    id
                }
            }
        )
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}

export type JumpDto = {
    id: string,
    state: boolean
}

export const createJumpForPlayerInDb = async (payload: JumpDto): Promise<Jump | undefined> => {
    const {id, state} = payload
    try {
        const res = await prisma.jump.create({
            data: {
                isJumping: state,
                playerId: id
            }
        })
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in createPostInDb: ', err.message)
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            console.error('error happened in createPostInDb: ', err.message)
        }
        throw new Error('poop happened')
    }
}

export const pollAllJumpsInDb = async (lastPollingDate: number) => {
    try {
        const res = await prisma.jump.findMany({
            where: {
                createdAt: {
                    gt: new Date(lastPollingDate)
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return res
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error happened in gellAllPostsInDb: ', err.message)
        }
    }
}