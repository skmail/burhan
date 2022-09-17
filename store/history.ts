import create from "zustand";
import produce from "immer";
import { History } from "../types/History";

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
