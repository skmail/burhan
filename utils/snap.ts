import { PointTuple, Command, SnapResult } from "../types";

const inRange = (p1: number, p2: number, scale: number = 1, range = 4) => {
  const diff = Math.abs(Math.round(p1 - p2));
  const x = diff <= range / scale;
  return x;
};

export default function snap(
  handle: Command,
  points: Command[],
  scale: number = 1,
  zoom: number = 1,
  gridSize: number,
  snapToOtherPoints: boolean
): SnapResult {
  let result: SnapResult = {
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

  if (snapToOtherPoints) {
    for (let point of points) {
      if (point.id === handle.id) {
        // console.log("termninated by same point");
        continue;
      }
      if (
        point.args[0] === handle.args[0] &&
        point.args[1] === handle.args[1]
      ) {
        // console.log("terminated by dims");
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

      if (
        !isStrictHorizontal &&
        inRange(handle.args[1], point.args[1], scale)
      ) {
        result.command = point.command;
        result.args[1] = point.args[1];
        fromPoints.y = {
          command: point.command,
          args: [point.args[0], point.args[1]],
        };
      }
    }
  }

  const grid = gridSize / zoom;

  const isInsideGridCell = (v: number, v1: number, grid: number) => {
    const value = Math.round(Math.abs(v - v1));

    return value < grid / 4;
  };
  if (!fromPoints.x && gridSize) {
    const roundedX = Math.round(result.args[0] / grid) * grid;
    if (isInsideGridCell(roundedX, result.args[0], grid)) {
      result.args[0] = roundedX;
    }
  }

  if (!fromPoints.y && gridSize) {
    const roundedY = Math.round(result.args[1] / grid) * grid;

    if (isInsideGridCell(roundedY, result.args[1], grid)) {
      result.args[1] = roundedY;
    }
  }

  const guidelines = Object.values(fromPoints).filter(Boolean);
  return {
    ...result,
    fromPoints: guidelines,
  };
}
