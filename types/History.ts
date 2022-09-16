import { Matrix } from "@free-transform/core";
import { Box, Command, Table, TransformSnapshot } from "../types";

interface BaseHistory {
  sub?: History[];
}
export interface HistoryCommandUpdate extends BaseHistory {
  type: "command.update";
  payload: HistoryPayload<Command>;
}

export interface HistoryCommandsUpdate extends BaseHistory {
  type: "commands.update";
  payload: HistoryPayload<Record<string, Command>>;
}

export interface HistoryCommandsDelete extends BaseHistory {
  type: "commands.delete";
  payload: HistoryPayload<Table<Command>>;
}

export interface HistoryCommandsAdd extends BaseHistory {
  type: "commands.add";
  payload: HistoryPayload<Table<Command>>;
}

export interface HistoryTransform extends BaseHistory {
  type: "transform";
  payload: HistoryPayload<TransformSnapshot>;
}

export type History =
  | HistoryTransform
  | HistoryCommandUpdate
  | HistoryCommandsUpdate
  | HistoryCommandsDelete
  | HistoryCommandsAdd;

export interface HistoryManager {
  canRedo: boolean;
  canUndo: boolean;
  addToHistory: (item: History) => void;
}

export type HistoryPayload<T> = {
  old: T;
  new: T;
};
