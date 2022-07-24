import { Handle, PointTuple } from "../types";

const inRange = (p1: number, p2: number, range = 15, scale: number = 1) => {
  const diff = Math.abs(Math.round(p1 - p2));
  const x = diff <= range / scale;
  return x;
};

interface HandleWithExtendedTypes extends Omit<Handle, "type"> {
  type: string;
}
type Result = {
  type: string;
  points: PointTuple;
  fromPoints: PointTuple[];
};
export default function snap(
  handle: Handle,
  points: HandleWithExtendedTypes[],
  scale: number = 1
): Result {
  let result: Result = {
    type: "none",
    points: [handle.points[0], handle.points[1]],
    fromPoints: [],
  };
  let matches = {
    x: false,
    y: false,
  };
  for (let point of points) {
    if (point.id === handle.id) {
      continue;
    }

    if (
      !matches.x &&
      (point.type === "width" || point.type == "x" || point.type == "point") &&
      inRange(handle.points[0], point.points[0], undefined, scale)
    ) {
      result.points[0] = point.points[0];
      result.type = point.type;
      result.fromPoints.push([point.points[0], point.points[1]]);
      matches.x = true;
    }

    if (
      !matches.y &&
      inRange(handle.points[1], point.points[1], undefined, scale)
    ) {
      result.points[1] = point.points[1];
      result.type = point.type;
      result.fromPoints.push([point.points[0], point.points[1]]);
      matches.y = true;
    }

    if (matches.x && matches.y) {
      return result;
    }
  }
  return result;
}
