import {
  Matrix,
  applyToPoints,
  multiply,
  translate,
  matrixTranslate,
} from "@free-transform/core";
import { useMemo } from "react";
import { Path } from "react-konva";
import shallow from "zustand/shallow";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useTransformStore } from "../../../store/transform";
import { Box } from "../../../types";
import { usePointsUpdate } from "./usePointsUpdate";

interface Props {
  matrix: Matrix;
  affineMatrix: Matrix;
  perspectiveMatrix: Matrix;
  scale: number;
  bounds: Box;
}
export function Grid({ matrix, affineMatrix, bounds, scale }: Props) {
  const data = useMemo(() => {
    const points = applyToPoints(matrix, [
      [0, 0],
      [0, bounds.height],
      [bounds.width, bounds.height],
      [bounds.width, 0],
    ]);

    const data = points.map((point, i) => {
      const data = [];
      if (i === 0) {
        data.push(`M`);
      } else {
        data.push(`L`);
      }

      data.push(
        `${(point[0] * scale).toFixed(10)} ${(point[1] * scale).toFixed(10)}`
      );

      return data.join(" ");
    });

    data.push("Z");
    
    return data.join(" ");
  }, [matrix, scale, bounds]);

  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const commandsTable = useMemo(() => getCommands(), []);
  const updatePoints = usePointsUpdate();

  return (
    <>
      <Path
        onMouseDown={(event) => {
          useFontStore.getState().updateSnapshot(getCommands());
          event.evt.stopPropagation();
          event.evt.preventDefault();
          const selections = useCommandStore.getState().selected;

          const drag = translate(
            {
              x: 0,
              y: 0,
              start: [event.evt.pageX / scale, event.evt.pageY / scale],
            },
            ({ x, y }) => {
              const affine = multiply(matrixTranslate(x, y), affineMatrix);
              useTransformStore.getState().updateAffineMatrix(affine);

              updatePoints(
                {
                  ...commandsTable,
                  ids: selections,
                },
                bounds,
                multiply(affine, useTransformStore.getState().perspectiveMatrix)
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
                  return target[key] / scale;
                }
                return target[key];
              },
            };
            const proxy = new Proxy(e, handler);
            drag(proxy);
          };

          const up = () => {
            useFontStore.getState().updateSnapshot();
            document.removeEventListener("pointermove", _drag);
            document.removeEventListener("pointerup", up);
          };
          document.addEventListener("pointermove", _drag);
          document.addEventListener("pointerup", up);
        }}
        data={data}
        stroke={"#d1d5db"}
        strokeWidth={1}
      />
    </>
  );
}
