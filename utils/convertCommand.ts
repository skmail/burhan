import { Command, Table } from "../types";
import { insertToArray } from "./insertToArray";
import normalize from "./normalize";

const is = (command: Command[], commandType: Command["command"]) => {
  return command[0].command === commandType;
};

export function convertCommand(
  from: Command,
  to: Command[],
  commands: Table<Command>
): Table<Command> {
  let ids = commands.ids;
  let items: Table<Command>["items"] = {};

  const index = commands.ids.indexOf(from.id);
  if (from.command === "lineTo" && is(to, "bezierCurveToCP1")) {
    const payload = normalize(to);

    ids = insertToArray(commands.ids, index, payload.ids, 1);
    items = payload.items;
  }
  return {
    ids,
    items,
  };
}
