import { useEffect, useMemo, useState, RefObject } from "react";
import useFresh from "../../../hooks/useFresh";
import { Command, Font, OnCommandsAdd } from "../../../types";
import commandsToPathData from "../../../utils/commandsToPathData";
import computePathCommands from "../../../utils/computePathCommands";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  scaleWithoutZoom: number;
  workspaceRef: RefObject<HTMLDivElement>;
  onCommandsAdd: OnCommandsAdd;
  commands: Font["glyphs"]["items"]["0"]["path"]["commands"];
}

export default function useDrawingPen({
  x,
  baseline,
  scale,
  workspaceRef,
  commands,
  onCommandsAdd,
}: Props) {
  const getFreshCommands = useFresh(commands);

  useEffect(() => {
    return;
    const onMouseDown = (e: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }
      const freshCommands = getFreshCommands();

      const box = workspaceRef.current.getBoundingClientRect();
      const xx = e.clientX - box.x;
      const yy = box.y - e.clientY;

      let command: Command["command"] = "lineTo";

      const lastCommand =
        freshCommands.items[freshCommands.ids[freshCommands.ids.length - 1]];

      if (!lastCommand || lastCommand.command == "closePath") {
        command = "moveTo";
      }

      const c: Command = {
        id: String(Math.random()),
        command,
        args: [(xx - x) / scale, (baseline + yy) / scale],
      };
      onCommandsAdd({
        ids: [...freshCommands.ids, c.id],
        items: {
          [c.id]: c,
        },
      });
    };

    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [scale, x, baseline]);

  return {
    isDrawing: false,
    data: "",
  };
}
