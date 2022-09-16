import { PointTuple } from "../types";

export default function toGlyphPoint(
  point: PointTuple,
  origin: PointTuple,
  scale: number
): PointTuple {
  return [(point[0] - origin[0]) / scale, (point[1] - origin[1]) / scale];
}
