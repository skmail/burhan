import create from "zustand";
import produce from "immer";
import { Bounds, Guideline } from "../../types";
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

  disableDrawing: () => void;
  enableDrawing: () => void;
  toggleDrawing: () => void;

  contextMenu: {
    active: boolean;
    item?: string;
    position: [number, number];
  };
  enableContextMenu: (item: string, position: [number, number]) => void;
  disableContextMenu: () => void;
  updateContextMenuPosition: (position: [number, number]) => void;

  bounds: Bounds;
  setBounds: (bounds: Bounds) => void;
}

export const useWorkspaceStore = create<State>((set) => ({
  bounds: {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  },
  contextMenu: {
    active: false,
    item: undefined,
    position: [0, 0],
  },
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
  setBounds: (bounds: Bounds) =>
    set(
      produce<State>((state) => {
        state.bounds = bounds;
      })
    ),
  disableDrawing: () =>
    set(
      produce<State>((state) => {
        state.drawing.enabled = false;
      })
    ),
  enableDrawing: () =>
    set(
      produce<State>((state) => {
        state.drawing.enabled = true;
      })
    ),
  toggleDrawing: () =>
    set(
      produce<State>((state) => {
        state.drawing.enabled = !state.drawing.enabled;
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

  enableContextMenu: (item, position) =>
    set(
      produce<State>((state) => {
        state.contextMenu = {
          active: true,
          item,
          position,
        };
      })
    ),
  disableContextMenu: () =>
    set(
      produce<State>((state) => {
        state.contextMenu = {
          active: false,
          item: undefined,
          position: [0, 0],
        };
      })
    ),
  updateContextMenuPosition: (position) =>
    set(
      produce<State>((state) => {
        state.contextMenu.position = position;
      })
    ),
}));
