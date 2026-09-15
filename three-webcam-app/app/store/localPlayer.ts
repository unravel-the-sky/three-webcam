import { useSyncExternalStore } from "react";

export type LocalPlayer = { id: string; username: string; color: string };

const STORAGE_KEY = "three-webcam:player";
const CHANGE_EVENT = "three-webcam:player-change";

let cachedRaw: string | null = null;
let cachedPlayer: LocalPlayer | null = null;

/** Parses at most once per distinct stored value so snapshots stay referentially stable. */
const getSnapshot = (): LocalPlayer | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPlayer = raw ? (JSON.parse(raw) as LocalPlayer) : null;
  }
  return cachedPlayer;
};

// `undefined` = not hydrated yet, so the UI can show a loading state on the server.
const getServerSnapshot = () => undefined;

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
};

export const setLocalPlayer = (player: LocalPlayer | null) => {
  if (player) localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

/** The player this phone signed up as, persisted in localStorage. */
export const useLocalPlayer = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
