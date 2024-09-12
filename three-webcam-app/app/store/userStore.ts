import { create } from "zustand";

export type UserType = {
    username: string;
    color: string;
    image?: string;
}

export type UserStore = {
    user: UserType,
    setUser: (payload: UserType) => void;
}

const useUserStore = create<UserStore>((set, get) => ({
    user: {
        color: '',
        username: ''
    },
    setUser: (payload: UserType) => set(
        (state) => (
            {
                user: { ...state.user, ...payload }
            }
        )
    )
}))

export default useUserStore;