import { Bounds } from "../types";

export function inRange(point: [number, number], bounds: Bounds) {
  return (
    point[0] > bounds.x &&
    point[0] < bounds.x + bounds.width &&
    point[1] > bounds.y &&
    point[1] < bounds.y + bounds.height
  );
}
