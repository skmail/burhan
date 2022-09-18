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
import { deleteCommands } from "../../../../utils/deleteCommands";
import { getDefaultBounds } from "../../../../utils/getDefaultBounds";
import normalize from "../../../../utils/normalize";
import { parseStringSvgPath } from "../../../../utils/parseStringSvgPath";
import { pointsToBezier } from "../../../../utils/pointsToBezier";
import toGlyphPoint from "../../../../utils/toGlyphPoint";
import { usePointsUpdate } from "../../TransformControl/usePointsUpdate";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  workspaceRef: RefObject<HTMLDivElement>;
}

export function usePencil({ x, baseline, scale, workspaceRef }: Props) {
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

    let ids = getCommands().ids;
    const table: Table<Command> = {
      ids: [],
      items: {},
    };
    const onMouseDown = (e: MouseEvent) => {
      startPoint = [e.clientX, e.clientY];
      const { x, scale, baseline } = getPointers();

      isStarted = true;
      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;
      const point = toGlyphPoint([xx, yy], [x, baseline], scale);

      const command: Command = {
        id: String(Math.random()),
        command: "moveTo",
        args: point,
      };
      table.ids = [command.id];
      table.items = {
        [command.id]: command,
      };
      ids = getCommands().ids
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isStarted) {
        return;
      }

      const { x, scale, baseline } = getPointers();

      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;
      const point = toGlyphPoint([xx, yy], [x, baseline], scale);

      const command: Command = {
        id: String(Math.random()),
        command: "lineTo",
        args: point,
      };
      table.ids.push(command.id);
      table.items[command.id] = command;

      useFontStore.getState().replaceCommands({
        ids: [...ids, ...table.ids],
        items: table.items,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      isStarted = false;
      const result = deleteCommands(getCommands(), table.ids);
      const bz = pointsToBezier(table.ids.map((id) => table.items[id].args));
      for (let i = 0; i < bz.length; i++) {
        result.ids = [...result.ids, bz[i].id];
        result.items[bz[i].id] = bz[i];
      }

      useFontStore.getState().replaceCommands(result);

      useWorkspaceStore.getState().setGuidelines([]);
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
