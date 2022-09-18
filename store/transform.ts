import create from "zustand";
import produce from "immer";
import { identity, Matrix, multiply } from "@free-transform/core";
import {
  Bounds,
  Box,
  Command,
  Table,
  TransformDirection,
  TransformHandle,
  TransformSnapshot,
} from "../types";

import computCommandsBounds from "../utils/computCommandsBounds";
import { getDefaultBounds } from "../utils/getDefaultBounds";

interface State {
  enabled: boolean;
  affineMatrix: Matrix;
  perspectiveMatrix: Matrix;
  targetMatrix: Matrix;

  updateAffineMatrix: (matrix: Matrix) => void;
  updatePerspectiveMatrix: (matrix: Matrix) => void;

  enable: () => void;
  disable(): void;
  toggle(): void;

  activeTransformDirection?: TransformDirection;
  activeTransformHandle?: TransformHandle;
  activeTransformPosition?: [number, number];

  updateActiveTransformDirection: (handle?: TransformDirection) => void;
  updateActiveTransformHandle: (handle?: TransformHandle) => void;
  updateActiveTransformPosition: (position?: [number, number]) => void;

  origin: [number, number];
  setOrigin: (point: [number, number]) => void;

  bounds: Box & Bounds;
  setCommands: (commands: Table<Command>) => void;

  commands: Table<Command>;
  updateSnapshot: () => void;
  snapshot: TransformSnapshot;

  applyFromSnapshot: (snapshot: TransformSnapshot) => void;
}

export const useTransformStore = create<State>((set) => ({
  enabled: false,
  affineMatrix: identity(),
  perspectiveMatrix: identity(),
  targetMatrix: identity(),

  activeTransformDirection: undefined,
  activeTransformHandle: undefined,

  origin: [0.5, 0.5],

  bounds: getDefaultBounds(),

  commands: {
    ids: [],
    items: {},
  },

  updateSnapshot: () =>
    set(
      produce<State>((state) => {
        state.snapshot = {
          affineMatrix: state.affineMatrix,
          perspectiveMatrix: state.perspectiveMatrix,
          bounds: state.bounds,
        };
      })
    ),
  snapshot: {
    affineMatrix: identity(),
    perspectiveMatrix: identity(),
    bounds: getDefaultBounds(),
  },

  setCommands: (commands) =>
    set(
      produce<State>((state) => {
        state.commands = commands;
        state.bounds = computCommandsBounds(commands, 1);
      })
    ),

  setOrigin: (origin) =>
    set(
      produce<State>((state) => {
        state.origin = origin;
      })
    ),

  updateActiveTransformDirection: (direction) =>
    set(
      produce<State>((state) => {
        state.activeTransformDirection = direction;
      })
    ),

  updateActiveTransformHandle: (handle) =>
    set(
      produce<State>((state) => {
        state.activeTransformHandle = handle;
      })
    ),

  updateActiveTransformPosition: (position) =>
    set(
      produce<State>((state) => {
        state.activeTransformPosition = position;
      })
    ),

  toggle: () =>
    set(
      produce<State>((state) => {
        state.enabled = !state.enabled;

        if (!state.enabled) {
          state.enabled = false;
          state.affineMatrix = identity();
          state.perspectiveMatrix = identity();
          state.targetMatrix = identity();
          state.bounds = getDefaultBounds();
          state.snapshot = {
            affineMatrix: identity(),
            perspectiveMatrix: identity(),
            bounds: getDefaultBounds(),
          };
        }
      })
    ),
  disable: () =>
    set(
      produce<State>((state) => {
        state.enabled = false;
        state.affineMatrix = identity();
        state.perspectiveMatrix = identity();
        state.targetMatrix = identity();

        state.bounds = getDefaultBounds();

        state.snapshot = {
          affineMatrix: identity(),
          perspectiveMatrix: identity(),
          bounds: getDefaultBounds(),
        };
      })
    ),
  enable: () =>
    set(
      produce<State>((state) => {
        state.enabled = true;
        state.affineMatrix = identity();
        state.perspectiveMatrix = identity();
        state.targetMatrix = identity();
        state.bounds = getDefaultBounds();

        state.snapshot = {
          affineMatrix: identity(),
          perspectiveMatrix: identity(),
          bounds: getDefaultBounds(),
        };
      })
    ),

  updateAffineMatrix: (matrix: Matrix) =>
    set(
      produce<State>((state) => {
        state.affineMatrix = matrix;
        state.targetMatrix = multiply(matrix, state.perspectiveMatrix);
      })
    ),

  updatePerspectiveMatrix: (matrix: Matrix) =>
    set(
      produce<State>((state) => {
        state.perspectiveMatrix = matrix;
        state.targetMatrix = multiply(state.affineMatrix, matrix);
      })
    ),

  applyFromSnapshot: (snapshot: TransformSnapshot) =>
    set(
      produce<State>((state) => {
        state.affineMatrix = snapshot.affineMatrix;
        state.perspectiveMatrix = snapshot.perspectiveMatrix;
        state.bounds = snapshot.bounds;

        state.targetMatrix = multiply(
          state.affineMatrix,
          state.perspectiveMatrix
        );
      })
    ),
}));
