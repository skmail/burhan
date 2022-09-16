import { Command, Table } from "../types";

export default function computCommandsBounds(
  commands: Table<Command>,
  scale = 1
) {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    height: 0,
    width: 0,
  };

  for (let id of commands.ids) {
    const command = commands.items[id];
    if (!command.args.length) {
      continue;
    }
    bounds.minX = Math.min(command.args[0], bounds.minX);
    bounds.minY = Math.min(command.args[1], bounds.minY);
    bounds.maxX = Math.max(command.args[0], bounds.maxX);
    bounds.maxY = Math.max(command.args[1], bounds.maxY);
  }
  return {
    ...bounds,
    width: (bounds.maxX - bounds.minX) * scale,
    height: (bounds.maxY - bounds.minY) * scale,
    x: bounds.minX * scale,
    y: bounds.minY * scale,
  };
}
