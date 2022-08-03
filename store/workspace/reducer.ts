import create from "zustand";
import produce from "immer";

interface State {
  ready: boolean;
  keyboard: Record<string, boolean>;
  setReady: () => void;
  setKeyboardKeys: (keys: Record<string, boolean>) => void;
  resetKeyboardKeys: () => void;
}

export const useWorkspaceStore = create<State>((set) => ({
  ready: false,
  keyboard: {},

  setReady: () =>
    set(
      produce<State>((state) => {
        state.ready = true;
      })
    ),

  setKeyboardKeys: (keys: Record<string, boolean>) =>
    set(
      produce<State>((state) => {
        state.keyboard = {
          ...state.keyboard,
          ...keys,
        };
      })
    ),

  resetKeyboardKeys: () =>
    set(
      produce<State>((state) => {
        state.keyboard = {};
      })
    ),
}));
