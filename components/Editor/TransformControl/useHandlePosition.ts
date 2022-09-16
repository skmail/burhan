import {
  applyToPoint,
  decompose,
  getAngle,
  getPointAtAngle,
  Matrix,
  Point,
  toDegree,
} from "@free-transform/core";
import { useMemo } from "react";
import { getRealRotation } from "../../../utils/getRealRotation";

interface Props {
  position: [number, number];
  offset: [number, number];
  affineMatrix: Matrix;
  matrix: Matrix;
  width: number;
  height: number;
  size: number;
}

export function useHandlePosition({
  position,
  offset,

  matrix,
  affineMatrix,

  width,
  height,
  size = 5,
}: Props) {
  return useMemo(() => {
    const decomposed = decompose(affineMatrix);

    const point1 = applyToPoint(matrix, [
      Math.floor(position[0]) * width,
      Math.floor(position[1]) * height,
    ]);
    const point2 = applyToPoint(matrix, [
      Math.ceil(position[0]) * width,
      Math.ceil(position[1]) * height,
    ]);
    const center = applyToPoint(matrix, [0.5 * width, 0.5 * height]);
    const find = (p1: number, p2: number, per: number) => p1 + (p2 - p1) * per;
    const percentage = Math.abs(position[0] - position[1]);
    const point: Point = [
      find(point1[0], point2[0], percentage),
      find(point1[1], point2[1], percentage),
    ];

    const radians = getRealRotation(decomposed.rotation.angle);
    const directionAngle = getRealRotation(getAngle(point, center));
    const offsetPosition = getPointAtAngle(
      [offset[0] * size, offset[1] * size],
      radians
    );

    return {
      x: point[0],
      y: point[1],
      offset: offsetPosition,
      angle: -toDegree(radians),
      directionAngle: -directionAngle,
    };
  }, [affineMatrix, matrix, width, height]);
}
