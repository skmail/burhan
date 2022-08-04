import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { History } from "../types/History";

import create from "zustand";
import produce from "immer";
import useFreshSelector from "./useFreshSelector";
import shallow from "zustand/shallow";

type State = {
  items: History[];
  index: number;
  updateIndex: (index: number) => void;
  add: (item: History) => void;
};

export const useHistoryStore = create<State>((set) => ({
  items: [],
  index: -1,

  updateIndex: (index: number) =>
    set(
      produce<State>((state) => {
        state.index = index;
      })
    ),

  add: (item: History) =>
    set(
      produce<State>((state) => {
        state.items = [...state.items.slice(0, state.index + 1), item];
        state.index += 1;
      })
    ),
}));

export default function useHistory(
  apply: (history: History, payloadkey: "new" | "old") => void
) {
  const [canRedo, canUndo] = useHistoryStore(
    (state) => [state.index < state.items.length - 1, state.index > -1],
    shallow
  );

  const updateIndex = useHistoryStore((state) => state.updateIndex);

  const getState = useFreshSelector<State>(useHistoryStore, (state) => state);

  const redo = useCallback(() => {
    const nextIndex = getState().index + 1;
    apply(getState().items[nextIndex], "new");
    updateIndex(nextIndex);
  }, []);

  const undo = useCallback(() => {
    apply(getState().items[getState().index], "old");
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
