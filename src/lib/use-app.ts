import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, type AppState } from "@/services/api";

/** Live Athenks data. Empty with ready=false during server render and first paint. */
export function useApp(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
