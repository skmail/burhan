import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { History } from "../types/History";

import shallow from "zustand/shallow";
import { useHistoryStore } from "../store/history";

export default function useHistory(
  apply: (history: History, payloadkey: "new" | "old") => void
) {
  const [canRedo, canUndo] = useHistoryStore(
    (state) => [state.index < state.items.length - 1, state.index > -1],
    shallow
  );

  const updateIndex = useHistoryStore((state) => state.updateIndex);

  const getState = useCallback(useHistoryStore.getState, []);

  const runApply = (item: History, type: "new" | "old") => {
    apply(item, type);

    if (item.sub) {
      for (let sub of item.sub) {
        runApply(sub, type);
      }
    }
  };
  const redo = useCallback(() => {
    const nextIndex = getState().index + 1;
    runApply(getState().items[nextIndex], "new");
    updateIndex(nextIndex);
  }, []);

  const undo = useCallback(() => {
    runApply(getState().items[getState().index], "old");
    updateIndex(getState().index - 1);
  }, []);

  const add = useHistoryStore((state) => state.add);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        if (canRedo) {
          redo();
        }
      } else if (canUndo && (e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canRedo, canUndo]);

  const result = useMemo(
    () => ({
      canRedo,
      canUndo,
      addToHistory: add,
      redo,
      undo,
    }),
    [canRedo, canUndo, add, redo, undo]
  );
  return result;
}
