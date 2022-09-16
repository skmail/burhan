import { Rect } from "react-konva";
import { Box } from "../../../types";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import useCommandStore from "../../../store/commands/reducer";
import { useTransformStore } from "../../../store/transform";
import { clamp, Matrix, multiply, rotate } from "@free-transform/core";
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

  x: number;
  y: number;
}

export default function Rotate({
  position,
  offset = position,
  matrix,
  affineMatrix,
  scale: scaleValue,
  x: _x,
  y: _y,
}: Props) {
  const bounds = useTransformStore((state) => state.bounds, shallow);

  const updateAffineMatrix = useTransformStore(
    (state) => state.updateAffineMatrix
  );

  const getSelections = useFreshSelector(
    useCommandStore,
    (state) => state.selected
  );
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const updateSnapshot = useFontStore((state) => state.updateSnapshot);

  const updatePoints = usePointsUpdate();

  const isTransforming = useFontStore((state) => !!state.snapshot);

  const size = 25;

  const handlePosition = useHandlePosition({
    width: bounds.width,
    height: bounds.height,

    affineMatrix,
    matrix,

    position,
    offset,
    size: 2,
  });

  return (
    <>
      <Rect
        offsetY={size / 2}
        offsetX={size / 2}
        width={size}
        height={size}
        strokeWidth={1}
        x={handlePosition.x * scaleValue + handlePosition.offset[0]}
        y={handlePosition.y * scaleValue + handlePosition.offset[1]}
        rotation={handlePosition.angle}
        onMouseEnter={() => {
          if (!isTransforming) {
            buildDirectedImage(handlePosition.directionAngle).then((img) => {
              document.body.style.cursor = `url(${img}) 20 25, auto`;
            });
          }
        }}
        onMouseLeave={() => {
          if (!isTransforming) {
            document.body.style.cursor = "auto";
          }
        }}
        onMouseDown={(event) => {
          useTransformStore.getState().updateActiveTransformHandle("rotate");
          useTransformStore.getState().updateActiveTransformPosition(position);
          updateSnapshot(getCommands());
          useTransformStore.getState().updateSnapshot();
          event.evt.stopPropagation();
          event.evt.preventDefault();
          const selections = getSelections();

          let drag = rotate(
            event.evt.altKey ? position : [0.5, 0.5],
            {
              start: [
                event.evt.pageX / scaleValue,
                event.evt.pageY / scaleValue,
              ],
              offset: [_x / scaleValue, _y / scaleValue],
              x: 0,
              y: 0,
              width: bounds.width,
              height: bounds.height,
              matrix: matrix,
              affineMatrix,
              // @ts-ignore
              snap: (e: PointerEvent) => e.shiftKey,
              snapDegree: 15,
            },
            ({ matrix }) => {
              updateAffineMatrix(matrix);
              updatePoints(
                useTransformStore.getState().commands,
                bounds,
                multiply(matrix, useTransformStore.getState().perspectiveMatrix)
              );
            }
          );

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
            useFontStore.getState().commitSnapshotToHistory([
              {
                type: "transform",
                payload: {
                  new: {
                    affineMatrix: useTransformStore.getState().affineMatrix,
                    perspectiveMatrix:
                      useTransformStore.getState().perspectiveMatrix,
                    bounds: useTransformStore.getState().bounds,
                  },
                  old: useTransformStore.getState().snapshot,
                },
              },
            ]);
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
    </>
  );
}
