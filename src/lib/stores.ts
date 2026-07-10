import { create } from "zustand";
import { persist } from "zustand/middleware";

type LocaleStore = {
  locale: "en" | "ms";
  setLocale: (locale: "en" | "ms") => void;
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "ms",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "luthsplayground-locale" },
  ),
);

type SyncStore = {
  syncState: "saved" | "saving" | "offline" | "migrating";
  syncVersion: number;
  setSyncState: (state: SyncStore["syncState"]) => void;
  setSyncVersion: (v: number) => void;
};

export const useSyncStore = create<SyncStore>((set) => ({
  syncState: "offline",
  syncVersion: 1,
  setSyncState: (syncState) => set({ syncState }),
  setSyncVersion: (syncVersion) => set({ syncVersion }),
}));
