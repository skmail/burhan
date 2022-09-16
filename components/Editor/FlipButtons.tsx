import { applyToPoint, matrixScale, multiply } from "@free-transform/core";
import { useRef } from "react";
import shallow from "zustand/shallow";
import useCommandStore from "../../store/commands/reducer";
import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import { useTransformStore } from "../../store/transform";
import computCommandsBounds from "../../utils/computCommandsBounds";
import Button from "../Button";
import { usePointsUpdate } from "./TransformControl/usePointsUpdate";

export function FlipButtons() {
  const update = usePointsUpdate();

  const lastFlip = useRef<Record<string, [number, number]>>({});
  const flip = (x = 1, y = 1) => {
    const commands = selectCommandsTable(useFontStore.getState());

    const selections = useCommandStore.getState().selected;

    const ids = selections.length ? selections : commands.ids;

    let bounds = computCommandsBounds({
      ...commands,
      ids,
    });

    const lastOrigin = lastFlip.current[`${x}-${y}`] || origin;
    const o: [number, number] = lastOrigin;
    lastFlip.current[`${x}-${y}`] = [1 - lastOrigin[0], 1 - lastOrigin[1]];

    let mat = matrixScale(x, y, [bounds.width * o[0], bounds.height * o[1]]);

    if (useTransformStore.getState().enabled) {
      const affineMatrix = useTransformStore.getState().affineMatrix;

      const bounds = useTransformStore.getState().bounds;

      const mat = multiply(
        matrixScale(x, y, [
          bounds.width * origin[0],
          bounds.height * origin[1],
        ]),
        affineMatrix
      );

      useTransformStore.getState().updateAffineMatrix(mat);

      update(
        useTransformStore.getState().commands,
        bounds,
        multiply(mat, useTransformStore.getState().perspectiveMatrix)
      );
    } else {
      update(
        {
          ...commands,
          ids,
        },
        bounds,
        mat
      );
    }
  };
  const flipY = () => {
    flip(1, -1);
  };

  const flipX = () => {
    flip(-1, 1);
  };

  const origin = useTransformStore((state) => state.origin, shallow);
  const setOrigin = useTransformStore((state) => state.setOrigin, shallow);

  const origins: [number, number][][] = [
    [
      [0, 0],
      [0.5, 0],
      [1, 0],
    ],
    [
      [0, 0.5],
      [0.5, 0.5],
      [1, 0.5],
    ],
    [
      [0, 1],
      [0.5, 1],
      [1, 1],
    ],
  ];
  return (
    <div className="flex space-x-2 ">
      <Button onClick={flipY} className="px-2">
        Flip Y
      </Button>
      <Button onClick={flipX} className="px-2">
        Flip X
      </Button>

      <div className="">
        {origins.map((origins, index) => (
          <div className="flex" key={index}>
            {origins.map((o, index) => (
              <div
                onClick={() => {
                  setOrigin(o);
                  lastFlip.current = {};
                }}
                key={index}
                className={`w-2 m-[1.5px] cursor-pointer transform hover:scale-110  h-2 ${
                  o[0] === 0.5 && o[1] === 0.5 ? "rounded-sm" : "rounded-full"
                } border  ${
                  o[0] === origin[0] && o[1] === origin[1]
                    ? "  border-active-2 bg-active-2  scale-110"
                    : "border-gray-500"
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
