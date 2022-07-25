import { useEffect, useRef, useState } from "react";
import { History } from "../types/History";

export default function useHistory(
  apply: (history: History, payloadkey: "new" | "old") => void
) {
  const [history, setHistory] = useState<History[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const canRedo = currentIndex < history.length - 1;
  const canUndo = currentIndex > -1;

  const fresh = useRef({
    canRedo,
    canUndo,
    currentIndex,
    history,
    apply,
  });

  fresh.current.canUndo = canUndo;
  fresh.current.canRedo = canRedo;
  fresh.current.currentIndex = currentIndex;
  fresh.current.history = history;
  fresh.current.apply = apply;

  const redo = () => {
    fresh.current.apply(
      fresh.current.history[fresh.current.currentIndex + 1],
      "new"
    );
    setCurrentIndex((index) => index + 1);
  };

  const undo = () => {
    fresh.current.apply(
      fresh.current.history[fresh.current.currentIndex],
      "old"
    );
    setCurrentIndex(fresh.current.currentIndex - 1);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        if (fresh.current.canRedo) {
          redo();
        }
      } else if (
        fresh.current.canUndo &&
        (e.metaKey || e.ctrlKey) &&
        e.code === "KeyZ"
      ) {
        undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return {
    history,
    canRedo,
    canUndo,
    addToHistory: (item: History) => {
      setHistory((history) => {
        history = [...history.slice(0, fresh.current.currentIndex + 1), item];
        setCurrentIndex(history.length - 1);
        return history;
      });
    },
    redo,
    undo,
  };
}
