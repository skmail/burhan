import { PointTuple } from "../types";

export default function computeDistance(p1: PointTuple, p2: PointTuple) {
  const a = p1[0] - p2[0];
  const b = p1[1] - p2[1];

  const c = Math.sqrt(a * a + b * b);

  return c;
}
