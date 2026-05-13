import { create } from "zustand";
import type { Session, SessionType } from "@/types";

interface SessionState {
  sessions: Session[];
  currentSessionType: SessionType;
  currentDuration: number;
  isRunning: boolean;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setCurrentSessionType: (type: SessionType) => void;
  setCurrentDuration: (duration: number) => void;
  setIsRunning: (running: boolean) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions: [],
  currentSessionType: "meditation",
  currentDuration: 10,
  isRunning: false,
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  setCurrentSessionType: (type) => set({ currentSessionType: type }),
  setCurrentDuration: (duration) => set({ currentDuration: duration }),
  setIsRunning: (running) => set({ isRunning: running }),
}));
