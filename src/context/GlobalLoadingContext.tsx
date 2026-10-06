import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

type GlobalLoadingContextValue = {
  runWithGlobalLoading<T>(action: () => Promise<T>): Promise<T>;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);
const MIN_LOADING_MS = 3000;

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const activeActions = useRef(0);
  const visibleUntil = useRef(0);

  const runWithGlobalLoading = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      activeActions.current += 1;
      visibleUntil.current = Math.max(visibleUntil.current, Date.now() + MIN_LOADING_MS);
      setVisible(true);

      try {
        return await action();
      } finally {
        activeActions.current -= 1;
        if (activeActions.current === 0) {
          while (activeActions.current === 0) {
            const remaining = visibleUntil.current - Date.now();
            if (remaining <= 0) break;
            await new Promise((resolve) => setTimeout(resolve, remaining));
          }
          if (activeActions.current === 0) setVisible(false);
        }
      }
    },
    [],
  );

  return (
    <GlobalLoadingContext.Provider value={{ runWithGlobalLoading }}>
      <>
        {children}
        <LoadingOverlay visible={visible} />
      </>
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading(): GlobalLoadingContextValue {
  const context = useContext(GlobalLoadingContext);
  if (!context) throw new Error("useGlobalLoading deve ser usado dentro de <GlobalLoadingProvider>.");
  return context;
}
