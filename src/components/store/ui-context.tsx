import { useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface FlashMessage {
  message: string;
  /** Page where the message should appear */
  path: string;
}

interface StoreUI {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  partyOpen: boolean;
  /** Open the party popup. goToCollection sends them to the collection after saving. */
  openParty: (opts?: { goToCollection?: boolean }) => void;
  closeParty: () => void;
  goToCollectionAfterParty: boolean;
  flash: FlashMessage | null;
  setFlash: (flash: FlashMessage | null) => void;
}

const Ctx = createContext<StoreUI | null>(null);

export function StoreUIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [goToCollectionAfterParty, setGo] = useState(true);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // Clear a message once the visitor moves away from the page it was meant for.
  const [seenOn, setSeenOn] = useState<string | null>(null);
  useEffect(() => {
    if (!flash) return;
    const here = pathname.replace(/\/$/, "") || "/";
    if (here === flash.path) setSeenOn(here);
    else if (seenOn === flash.path) {
      setFlash(null);
      setSeenOn(null);
    }
  }, [pathname, flash, seenOn]);

  const openParty = useCallback((opts?: { goToCollection?: boolean }) => {
    setGo(opts?.goToCollection ?? true);
    setPartyOpen(true);
  }, []);
  const closeParty = useCallback(() => setPartyOpen(false), []);

  const value = useMemo(
    () => ({
      cartOpen,
      setCartOpen,
      partyOpen,
      openParty,
      closeParty,
      goToCollectionAfterParty,
      flash,
      setFlash,
    }),
    [cartOpen, partyOpen, openParty, closeParty, goToCollectionAfterParty, flash],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoreUI(): StoreUI {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStoreUI must be used inside StoreUIProvider");
  return v;
}
