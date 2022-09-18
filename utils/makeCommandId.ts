import { Command } from "../types";
import { makeId } from "./makeId";

export function makeCommandId(command: Command, type?: string) {
  return makeId(command.id, type || command.command);
}
