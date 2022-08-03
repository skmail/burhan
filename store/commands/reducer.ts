import create from "zustand";
import produce from "immer";

interface State {
  hovered: string[];
  selected: string[];
  active: string[];

  hover: (id: string) => void;
  unhover: (id: string) => void;
  select: (ids: string | string[]) => void;
  activate: (id: string) => void;
  deactivate: (id: string) => void;

  toggleSelected: (id: string) => void;
}

const useCommandStore = create<State>((set) => ({
  count: 1,
  hovered: [],
  selected: [],
  active: [],
  hover: (id: string) =>
    set(
      produce<State>((state) => {
        if (!id && state.hovered.length) {
          state.hovered = [];
        } else if (id) {
          state.hovered = [id];
        }
      })
    ),

  unhover: (id: string) =>
    set(
      produce<State>((state) => {
        state.hovered = state.hovered.filter((i) => i !== id);
      })
    ),

  select: (ids: string | string[]) =>
    set(
      produce<State>((state) => {
        if (Array.isArray(ids)) {
          state.selected = ids;
        } else {
          if (ids === "new") {
            // state.selected = [];
            return;
          } else {
            state.selected = [ids];
          }
        }
      })
    ),

  activate: (id: string) =>
    set(
      produce<State>((state) => {
        if (id === "new") {
          return;
        } else if (!id && state.active.length) {
          state.active = [];
        } else if (id) {
          state.active = [id];
        }
      })
    ),

  deactivate: (id?: string) =>
    set(
      produce<State>((state) => {
        state.active = state.active.filter((i) => id !== i);
      })
    ),

  toggleSelected: (id: string) =>
    set(
      produce<State>((state) => {
        if (state.selected.includes(id)) {
          state.selected = state.selected.filter((i) => i !== id);
        } else {
          state.selected.push(id);
        }
      })
    ),
}));

export default useCommandStore;
