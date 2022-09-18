import { Command, Table } from "../types";

export function deleteCommands(
  commands: Table<Command>,
  selections: string[]
): Table<Command> {
  const queue = [...selections];

  const result: string[] = [];

  const items: Record<string, Command> = {};

  let ids = [...commands.ids];
  let _items: Record<string, Command> = { ...commands.items };

  while (queue.length > 0) {
    const id = queue.shift() as string;

    if (result.includes(id)) {
      continue;
    }

    const command = _items[id];
    const index = ids.indexOf(id);

    switch (command.command) {
      case "lineTo":
        result.push(id);
        break;
      case "bezierCurveTo":
        result.push(id, ids[index - 1], ids[index - 2]);
        break;
      case "bezierCurveToCP1":
        result.push(id, ids[index + 1], ids[index + 2]);
        break;
      case "bezierCurveToCP2":
        result.push(id, ids[index - 1], ids[index + 1]);
        break;
      case "moveTo":
        result.push(id);
        const nextIndex = index + 1;
        const next = _items[ids[nextIndex]];
        if (next) {
          if ("bezierCurveToCP1" === next.command) {
            result.push(ids[nextIndex + 1], ids[nextIndex + 2]);
          }
          if (next.command !== "closePath") {
            items[next.id] = {
              ...next,
              command: "moveTo",
            };
          }
        }
    }

    _items = {
      ...commands.items,
      ...items,
    };

    ids = ids.filter((id) => !result.includes(id));

    // heal the path

    for (let index = 0; index < ids.length; index++) {
      const prev = _items[ids[index - 1]];

      if (
        _items[ids[index]].command === "closePath" &&
        (!prev || prev.command === "closePath")
      ) {
        result.push(ids[index]);
      }
    }

    ids = ids.filter((id) => !result.includes(id));
  }

  return {
    ids,
    items,
  };
}
