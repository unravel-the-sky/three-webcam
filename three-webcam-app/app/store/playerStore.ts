import { create } from "zustand";
import type { JumpDirection } from "../components/client/AppWrapper";

export type PlayerMove = {
  jumpingPlayerId?: string;
  direction?: JumpDirection;
};

type PlayerStore = {
  data: PlayerMove;
  setData: (payload: PlayerMove) => void;
};

/**
 * Latest move received over Ably on the big screen. Each move is a fresh object
 * so balls can react to repeated presses of the same button.
 */
const usePlayerStore = create<PlayerStore>((set) => ({
  data: { jumpingPlayerId: "", direction: "left" },
  setData: (payload) => set((state) => ({ data: { ...state.data, ...payload } })),
}));

export default usePlayerStore;
