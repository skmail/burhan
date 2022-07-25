import { Command } from "../types";

export interface HistoryCommandUpdate {
  type: "command.update";
  payload: HistoryPayload<Command>;
}

export interface HistoryCommandsUpdate {
  type: "commands.update";
  payload: HistoryPayload<Record<string, Command>>;
}

export type History = HistoryCommandUpdate | HistoryCommandsUpdate;

export interface HistoryManager {
  canRedo: boolean;
  canUndo: boolean;
  addToHistory: (item: History) => void;
}

export type HistoryPayload<T> = {
  old: T;
  new: T;
};
