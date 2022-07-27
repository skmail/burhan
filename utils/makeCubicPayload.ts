import { Command } from "../types";

export default function makeCubicPayload(
  points: [number, number, number, number, number, number]
): Command[] {
  return [
    {
      id: String(Math.random()),
      command: "bezierCurveToCP1",
      //@ts-ignore
      args: [points[0], points[1]],
    },
    {
      id: String(Math.random()),
      command: "bezierCurveToCP2",
      //@ts-ignore
      args: [points[2], points[3]],
    },
    {
      id: String(Math.random()),
      command: "bezierCurveTo",
      //@ts-ignore
      args: [points[4], points[5]],
    },
  ];
}
