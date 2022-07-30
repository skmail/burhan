import svgPath from "svgpath";
import { Command, Table } from "../types";
import commandsToPathData from "./commandsToPathData";

export default function computCommandsBounds(commands: Table<Command>) {
  let result: Command[] = [];
  const path = svgPath(
    commandsToPathData(commands.ids.map((id) => commands.items[id]))
  );

  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    height: 0,
    width: 0,
  };
  path.iterate((segment) => {
    const [command, ...points] = segment;
    let pts = points;
    for (var j = 0; j < points.length; j += 2) {
      if (pts[j + 0] < bounds.minX) bounds.minX = pts[j + 0];
      if (pts[j + 1] < bounds.minY) bounds.minY = pts[j + 1];
      if (pts[j + 0] > bounds.maxX) bounds.maxX = pts[j + 0];
      if (pts[j + 1] > bounds.maxY) bounds.maxY = pts[j + 1];
    }
  });

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}
