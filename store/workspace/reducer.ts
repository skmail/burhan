import create from "zustand";
import produce from "immer";
import { Guideline, Vector } from "../../types";
import vector from "../../utils/vector";
type DrawingStep = "point" | "line" | "curve" | "end";

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
  guidelines: Guideline[];
  setGuidelines: (guidelines: Guideline[]) => void;

  drawing: {
    enabled: boolean;
    step: DrawingStep;
  };
  setDrawingStep: (step: DrawingStep) => void;
}

export const useWorkspaceStore = create<State>((set) => ({
  ready: false,
  keyboard: {},
  guidelines: [],

  drawing: {
    enabled: false,
    step: "point",
  },
  transformControls: {
    origin: vector(0, 0),
    angle: 0,
    enabled: false,
  },
  setDrawingStep: (step: State["drawing"]["step"]) =>
    set(
      produce<State>((state) => {
        state.drawing.step = step;
      })
    ),
  setGuidelines: (guidelines) =>
    set(
      produce<State>((state) => {
        state.guidelines = guidelines;
      })
    ),

  leftSidebar: true,
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
