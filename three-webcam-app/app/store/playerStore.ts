import { create } from "zustand";
import { JumpDirection } from "../components/client/AppWrapper";

export type PlayerListType = {
    jumpingPlayerId?: string;
    stopPlayerId?: string;
    direction?: JumpDirection,
    isGameOn?: boolean;
}

export type PlayerStore = {
    data: PlayerListType,
    setData: (payload: PlayerListType) => void;
}

const usePlayerStore = create<PlayerStore>((set, get) => ({
    data: {
        jumpingPlayerId: '',
        stopPlayerId: '',
        direction: 'left',
        isGameOn: false
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