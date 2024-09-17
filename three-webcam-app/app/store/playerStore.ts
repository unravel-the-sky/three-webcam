import { create } from "zustand";
import { JumpDirection } from "../components/client/AppWrapper";

export type PlayerListType = {
    jumpingPlayerId: string;
    direction: JumpDirection
}

export type PlayerStore = {
    data: PlayerListType,
    setData: (payload: PlayerListType) => void;
}

const usePlayerStore = create<PlayerStore>((set, get) => ({
    data: {
        jumpingPlayerId: '',
        direction: 'left'
    },
    setData: (payload: PlayerListType) => set(
        (state) => (
            {
                data: { ...state.data, ...payload }
            }
        )
    )
}))

export default usePlayerStore;