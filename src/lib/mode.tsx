import { createContext, useContext, useState, type ReactNode } from "react";

export type AppMode = "tutor" | "school";

interface ModeCtx {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

const Ctx = createContext<ModeCtx | null>(null);
const KEY = "tutordash:mode";

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(
    () => (localStorage.getItem(KEY) as AppMode) ?? "tutor"
  );

  function setMode(m: AppMode) {
    localStorage.setItem(KEY, m);
    setModeState(m);
  }

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export function useMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
