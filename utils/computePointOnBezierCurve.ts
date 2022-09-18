import { Bezier } from "bezier-js";
import { PointTuple } from "../types";
import computeDistance from "./computeDistance";

export function computePointOnBezierCurve(
  bz: Bezier,
  pos: PointTuple,
  percentage: number
) {
  const m = bz.project({
    x: pos[0],
    y: pos[1],
  });

  const distance = computeDistance([m.x, m.y], pos);
  let t = m.t || 0;

  if (percentage) {
    const inv = 1.0 / percentage;
    t = Math.min(
      Math.max(Math.round(t * inv) / inv, percentage),
      1 - percentage
    );
  }

  const p = bz.get(t);

  return {
    distance,
    point: {
      ...p,
      t,
    },
  };
}
