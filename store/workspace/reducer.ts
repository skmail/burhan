import create from "zustand";
import produce from "immer";

interface State {
  ready: boolean;
  keyboard: Record<string, boolean>;
  setReady: () => void;
  setKeyboardKeys: (keys: Record<string, boolean>) => void;
  resetKeyboardKeys: () => void;
  leftSidebar: boolean;
  toggleLeftSidebarSide: () => void;

  rightSidebar: boolean;
  toggleRightSidebarSide: () => void;
}

export const useWorkspaceStore = create<State>((set) => ({
  ready: false,
  keyboard: {},
  
  leftSidebar: false,
  toggleLeftSidebarSide: () =>
    set(
      produce<State>((state) => {
        state.leftSidebar = !state.leftSidebar;
      })
    ),

  rightSidebar: false,
  toggleRightSidebarSide: () =>
    set(
      produce<State>((state) => {
        state.rightSidebar = !state.rightSidebar;
      })
    ),

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
