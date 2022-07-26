import { PointTuple } from "../types";

export default function reflect(
  p0: PointTuple,
  p1: PointTuple,
  p2?: PointTuple
): PointTuple {
  const p: PointTuple = [2 * p1[0] - p0[0], 2 * p1[1] - p0[1]];

  if (p2) {
    // p[0] = p2[0] - 2 * p0[0] - p[0];
    // p[1] = p2[1] - 2 * p0[1] - p[1];
  }
  return p;
}
