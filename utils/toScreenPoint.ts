import { PointTuple } from "../types";

export default function toScreenPoint(
  point: PointTuple,
  origin: PointTuple,
  scale: number
): PointTuple {
  return [origin[0] + point[0] * scale, origin[1] + point[1] * scale];
}
