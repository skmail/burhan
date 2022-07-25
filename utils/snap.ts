import { PointTuple, Command } from "../types";

const inRange = (p1: number, p2: number, scale: number = 1, range = 4) => {
  const diff = Math.abs(Math.round(p1 - p2));
  const x = diff <= range / scale;
  return x;
};

type Result = {
  command: string;
  args: PointTuple;
  fromPoints: {
    command: string;
    args: PointTuple;
  }[];
};
export default function snap(
  handle: Command,
  points: Command[],
  scale: number = 1
): Result {
  let result: Result = {
    command: "none",
    args: [handle.args[0], handle.args[1]],
    fromPoints: [],
  };

  const fromPoints: Record<
    string,
    {
      command: string;
      args: PointTuple;
    }
  > = {};

  for (let point of points) {
    if (point.id === handle.id) {
      console.log("termninated by same point");
      continue;
    }
    if (point.args[0] === handle.args[0] && point.args[1] === handle.args[1]) {
      console.log("terminated by dims");
      continue;
    }

    const isStrictHorizontal = ["width", "x"].includes(point.command);
    const isHorizontal =
      isStrictHorizontal ||
      [
        "moveTo",
        "lineTo",
        "quadraticCurveTo",
        "quadraticCurveToCP",
        "bezierCurveTo",
        "bezierCurveToCP1",
        "bezierCurveToCP2",
      ].includes(point.command);

    if (isHorizontal && inRange(handle.args[0], point.args[0], scale)) {
      result.command = point.command;
      result.args[0] = point.args[0];
      fromPoints.x = {
        command: point.command,
        args: [point.args[0], point.args[1]],
      };
    }

    if (!isStrictHorizontal && inRange(handle.args[1], point.args[1], scale)) {
      result.command = point.command;
      result.args[1] = point.args[1];
      fromPoints.y = {
        command: point.command,
        args: [point.args[0], point.args[1]],
      };
    }
  }
  return {
    ...result,
    fromPoints: Object.values(fromPoints).filter(Boolean),
  };
}
