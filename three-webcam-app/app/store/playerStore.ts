import { create } from "zustand";

export type PlayerListType = {
    imgList: string[]
}

export type PlayerStore = {
    data: PlayerListType,
    setData: (payload: PlayerListType) => void;
}

const usePlayerStore = create<PlayerStore>((set, get) => ({
    data: {
        imgList: ['']
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