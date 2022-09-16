import { useMemo } from "react";
import { Rect } from "react-konva";
import { Box, Command } from "../../../types";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import useCommandStore from "../../../store/commands/reducer";
import { useTransformStore } from "../../../store/transform";
import {
  Matrix,
  scale,
  warp,
  makeWarpPoints,
  multiply,
  makePerspectiveMatrix,
  applyToPoints,
  Tuple,
  Point,
} from "@free-transform/core";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { useHandlePosition } from "./useHandlePosition";
import { usePointsUpdate } from "./usePointsUpdate";
import { buildDirectedImage } from "../../../utils/buildDirectedImage";
import shallow from "zustand/shallow";

interface Props {
  position: [number, number];
  offset?: [number, number];
  matrix: Matrix;
  affineMatrix: Matrix;
  perspectiveMatrix: Matrix;

  scale: number;

  bounds: Box;
  mode: "rotate" | "scale" | "warp";
}

export default function Scale({
  position,
  offset = position,
  matrix,
  affineMatrix,
  perspectiveMatrix,
  scale: scaleValue,
  mode,
}: Props) {
  const bounds = useTransformStore((state) => state.bounds, shallow);

  const updateAffineMatrix = useTransformStore(
    (state) => state.updateAffineMatrix
  );

  const updatePerspectiveMatrix = useTransformStore(
    (state) => state.updatePerspectiveMatrix
  );

  const getSelections = useFreshSelector(
    useCommandStore,
    (state) => state.selected
  );
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const updateSnapshot = useFontStore((state) => state.updateSnapshot);

  const commandsTable = useMemo(() => getCommands(), []);

  const updatePoints = usePointsUpdate();

  const { x, y, angle, directionAngle } = useHandlePosition({
    width: bounds.width,
    height: bounds.height,

    affineMatrix,
    matrix,

    position,
    offset,
    size: 5,
  });
  const isTransforming = useFontStore((state) => !!state.snapshot);

  return (
    <Rect
      offsetY={5}
      offsetX={5}
      width={10}
      height={10}
      fill="#fff"
      stroke={"#9ca3af"}
      strokeWidth={1}
      x={x * scaleValue}
      y={y * scaleValue}
      rotation={angle}
      onMouseEnter={(e) => {
        if (!isTransforming) { 
          buildDirectedImage(directionAngle, "/icons/scale.png").then((img) => {
            document.body.style.cursor = `url(${img}) 15 15, auto`;
          });
        }
      }}
      onMouseLeave={() => {
        if (!isTransforming) {
          document.body.style.cursor = "auto";
        }
      }}
      onMouseDown={(event) => {
        useTransformStore.getState().updateActiveTransformHandle(mode);
        useTransformStore.getState().updateActiveTransformPosition(position);

        updateSnapshot(getCommands());
        event.evt.stopPropagation();
        event.evt.preventDefault();
        const selections = getSelections();

        let drag: (event: PointerEvent) => void = () => {};

        if (mode === "scale") {
          drag = scale(
            position,
            {
              start: [
                event.evt.pageX / scaleValue,
                event.evt.pageY / scaleValue,
              ],
              matrix,
              affineMatrix,
              perspectiveMatrix,
              width: bounds.width,
              height: bounds.height,
              // @ts-ignore
              aspectRatio: (e: PointerEvent) => Boolean(e.shiftKey),
              // @ts-ignore
              fromCenter: (e: PointerEvent) => Boolean(e.altKey),
            },
            ({ matrix }) => {
              updateAffineMatrix(matrix);
              updatePoints(
                useTransformStore.getState().commands,
                bounds,
                multiply(matrix, perspectiveMatrix)
              );
            }
          );
        } else if (mode === "warp") {
          const originalWarp = makeWarpPoints(bounds.width, bounds.height);
          const warpPoints = applyToPoints(
            perspectiveMatrix,
            makeWarpPoints(bounds.width, bounds.height)
          ) as Tuple<Point, 4>;

          drag = warp(
            position,
            {
              matrix: affineMatrix,
              warp: warpPoints,
              start: [
                event.evt.pageX / scaleValue,
                event.evt.pageY / scaleValue,
              ],
            },
            ({ warp }) => {
              const perspective = makePerspectiveMatrix(originalWarp, warp);

              updatePerspectiveMatrix(perspective);

              updatePoints(
                useTransformStore.getState().commands,
                bounds,
                multiply(affineMatrix, perspective)
              );
            }
          );
        } else {
          return;
        }

        const _drag = (e: PointerEvent) => {
          const handler = {
            get(target: PointerEvent, key: keyof PointerEvent) {
              if (
                key === "pageX" ||
                key === "pageY" ||
                key === "clientX" ||
                key === "clientY"
              ) {
                return target[key] / scaleValue;
              }
              return target[key];
            },
          };
          const proxy = new Proxy(e, handler);
          drag(proxy);
        };
        const up = () => {
          updateSnapshot();
          useTransformStore.getState().updateActiveTransformHandle();
          useTransformStore.getState().updateActiveTransformPosition();
          document.removeEventListener("pointermove", _drag);
          document.removeEventListener("pointerup", up);
        };
        document.addEventListener("pointermove", _drag);
        document.addEventListener("pointerup", up);
      }}
    />
  );
}
