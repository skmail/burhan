import { Command, Table } from "../types";

export interface HistoryCommandUpdate {
  type: "command.update";
  payload: HistoryPayload<Command>;
}

export interface HistoryCommandsUpdate {
  type: "commands.update";
  payload: HistoryPayload<Record<string, Command>>;
}

export interface HistoryCommandsDelete {
  type: "commands.delete";
  payload: HistoryPayload<Table<Command>>;
}

export interface HistoryCommandsAdd {
  type: "commands.add";
  payload: HistoryPayload<Table<Command>>;
}

export type History =
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
