import { scale as doScale, identity, Point } from "@free-transform/core";
import { useEffect, RefObject } from "react";
import svgPath from "svgpath";
import shallow from "zustand/shallow";
import useFresh from "../../../../hooks/useFresh";
import useFreshSelector from "../../../../hooks/useFreshSelector";
import useCommandStore from "../../../../store/commands/reducer";
import {
  selectCommandsTable,
  useFontStore,
} from "../../../../store/font/reducer";
import { useTransformStore } from "../../../../store/transform";
import { useWorkspaceStore } from "../../../../store/workspace/reducer";
import { Command, PointTuple, Table } from "../../../../types";
import computCommandsBounds from "../../../../utils/computCommandsBounds";
import { getDefaultBounds } from "../../../../utils/getDefaultBounds";
import normalize from "../../../../utils/normalize";
import parseRawSvg from "../../../../utils/parseRawSvg";
import { parseStringSvgPath } from "../../../../utils/parseStringSvgPath";
import toGlyphPoint from "../../../../utils/toGlyphPoint";
import { usePointsUpdate } from "../../TransformControl/usePointsUpdate";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  workspaceRef: RefObject<HTMLDivElement>;
}

export function useCircle({ x, baseline, scale, workspaceRef }: Props) {
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const drawing = useWorkspaceStore((state) => state.drawing, shallow);

  const isExit = useWorkspaceStore((state) => state.keyboard.Escape);

  useEffect(() => {
    if (isExit) {
      useWorkspaceStore.getState().setGuidelines([]);
      useWorkspaceStore.getState().disableDrawing();
    }
  }, [isExit]);

  const [getPointers] = useFresh({
    scale,
    x,
    baseline,
  });
  const updatePoints = usePointsUpdate();

  useEffect(() => {
    if (!workspaceRef.current || !drawing.enabled) {
      return;
    }
    const element = workspaceRef.current;
    const box = useWorkspaceStore.getState().bounds;
    let isStarted = false;
    let startPoint: PointTuple = [0, 0];

    let circle: Table<Command> = { ids: [], items: {} };
    let bounds = getDefaultBounds();
    const onMouseDown = (e: MouseEvent) => {
      startPoint = [e.clientX, e.clientY];
      const { x, scale, baseline } = getPointers();

      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;
      const point = toGlyphPoint([xx, yy], [x, baseline], scale);

      const commands = getCommands();

      isStarted = true;

      const r = 1 / scale;

      circle = normalize(
        parseStringSvgPath(
          `
          m ${point[0]} ${point[1]}          
          a ${r},${r} 0 1,1 ${r * 2},0
          a ${r},${r} 0 1,1 -${r * 2},0
          Z
          `,
          r,
          r,
          [point[0] * 2, point[1] * 2]
        )
      );

      bounds = computCommandsBounds(circle);

      useFontStore.getState().replaceCommands({
        ids: [...commands.ids, ...circle.ids],
        items: circle.items,
      });
    };

    let matrix = identity();
    const onMouseMove = (e: MouseEvent) => {
      if (!isStarted) {
        return;
      }
      const { scale } = getPointers();

      doScale(
        [1, 1],
        {
          start: [startPoint[0] / scale, startPoint[1] / scale],
          matrix,
          width: bounds.width,
          height: bounds.height,
          // @ts-ignore
          aspectRatio: (e: PointerEvent) => {
            return Boolean(e.shiftKey);
          },
          // @ts-ignore
          fromCenter: (e: PointerEvent) => Boolean(e.altKey),
        },
        ({ matrix }) => {
          updatePoints(
            {
              ids: circle.ids,
              items: circle.items,
            },
            bounds,
            matrix
          );
        }
      )({
        //@ts-ignore
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        clientX: e.clientX / scale,
        clientY: e.clientY / scale,
      });
    };
    const onMouseUp = (e: MouseEvent) => {
      useWorkspaceStore.getState().setGuidelines([]);
      useWorkspaceStore.getState().disableDrawing();
      useCommandStore.getState().select(circle.ids);
      useTransformStore.getState().enable();
    };

    element.addEventListener("pointerdown", onMouseDown);
    element.addEventListener("pointermove", onMouseMove);
    element.addEventListener("pointerup", onMouseUp);

    return () => {
      element.removeEventListener("pointerdown", onMouseDown);
      element.removeEventListener("pointermove", onMouseMove);
      element.removeEventListener("pointerup", onMouseUp);
    };
  }, [drawing]);

  return drawing;
}
