import { create } from "zustand";

export type UserType = {
  username: string;
  color: string;
  image?: string;
};

type UserStore = {
  user: UserType;
  setUser: (payload: UserType) => void;
};

/** Sign-up form state on the phone, kept until the player is created. */
const useUserStore = create<UserStore>((set) => ({
  user: { color: "", username: "" },
  setUser: (payload) => set((state) => ({ user: { ...state.user, ...payload } })),
}));

export default useUserStore;
