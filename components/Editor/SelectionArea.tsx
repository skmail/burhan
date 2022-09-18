import { RefObject, useEffect, useRef, useState } from "react";
import useFreshSelector from "../../hooks/useFreshSelector";

import useCommandStore from "../../store/commands/reducer";
import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import { Bounds } from "../../types";
import { inRange } from "../../utils/inRange";
import onLeftButton from "../../utils/onLeftButton";
import toScreenPoint from "../../utils/toScreenPoint";

import vector from "../../utils/vector";

interface Props {
  workspaceRef: RefObject<HTMLDivElement>;
  scale: number;
  baseline: number;
  x: number;
}
export default function SelectionArea({
  workspaceRef,
  scale,
  baseline,
  x,
}: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const select = useCommandStore((state) => state.select);

  const getIsDrawing = useFreshSelector(
    useWorkspaceStore,
    (state: any) => state.drawing.enabled
  );
  const getActiveRuler = useFreshSelector(
    useFontStore,
    (state) => state.activeRuler
  );
  const getKeyboard = useFreshSelector(
    useWorkspaceStore,
    (state) => state.keyboard
  );
  useEffect(() => {
    if (!workspaceRef.current) {
      return;
    }
    let startX = 0;
    let startY = 0;
    let box: DOMRect;
    let handles = getCommands();

    const onMousedown = onLeftButton((e: MouseEvent) => {
      if (getIsDrawing() || getActiveRuler()) {
        return;
      }
      handles = getCommands();
      if (!workspaceRef.current) {
        return;
      }
      if (!getKeyboard().ShiftLeft) {
        select([]);
      }
      box = workspaceRef.current.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    const onMouseMove = (e: MouseEvent) => {
      let width = e.clientX - startX;
      let height = e.clientY - startY;

      const position = vector();

      if (width < 0) {
        position.x = e.clientX - box.x;
      } else {
        position.x = startX - box.x;
      }

      if (height < 0) {
        position.y = e.clientY - box.y;
      } else {
        position.y = startY - box.y;
      }

      width = Math.max(Math.abs(width), 0);
      height = Math.max(Math.abs(height), 0);

      const bounds = {
        x: position.x,
        y: position.y,
        width,
        height,
      };

      const found: string[] = [];

      for (let id of handles.ids) {
        const handle = handles.items[id];
        if (inRange(toScreenPoint(handle.args, [x, baseline], scale), bounds)) {
          found.push(handle.id);
        }
      }

      setBounds({
        width,
        height,
        x: position.x,
        y: position.y,
      });
      select(found, getKeyboard().ShiftLeft);
    };
    const onMouseUp = () => {
      setBounds({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    workspaceRef.current?.addEventListener("mousedown", onMousedown);

    return () => {
      workspaceRef.current?.removeEventListener("mousedown", onMousedown);
    };
  }, [scale, x, baseline]);

  if (!bounds.width || !bounds.height) {
    return null;
  }

  return (
    <div
      className="absolute ring-1 ring-sky-500 bg-sky-500 bg-opacity-5"
      style={{
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y,
      }}
    ></div>
  );
}
