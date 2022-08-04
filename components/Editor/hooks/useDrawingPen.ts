import { useEffect, RefObject } from "react";
import shallow from "zustand/shallow";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Command, Font, OnCommandsAdd } from "../../../types";

import useFontSelector from "../../../utils/useFontSelector";
import vector from "../../../utils/vector";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  scaleWithoutZoom: number;
  workspaceRef: RefObject<HTMLDivElement>;
}

export default function useDrawingPen({
  x,
  baseline,
  scale,
  workspaceRef,
}: Props) {
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const replaceCommands = useFontStore((state) => state.replaceCommands);
  const updateCommands = useFontStore((state) => state.updateCommands);

  const drawing = useWorkspaceStore((state) => state.drawing, shallow);
  const setDrawingStep = useWorkspaceStore(
    (state) => state.setDrawingStep,
    shallow
  );

  useEffect(() => {
    if (!workspaceRef.current || !drawing.enabled) {
      return;
    }
    const element = workspaceRef.current;
    const box = element.getBoundingClientRect();

    let onMouseDown: (e: MouseEvent) => void;
    let onMouseMove: (e: MouseEvent) => void;
    let onMouseUp: (e: MouseEvent) => void;
    if (drawing.step === "point") {
      onMouseDown = (e: MouseEvent) => {
        const commands = getCommands();

        const xx = e.clientX - box.x;
        const yy = box.y - e.clientY;
        const points: Command[] = [
          {
            id: String(Math.random()),
            command: "moveTo",
            args: [(xx - x) / scale, (baseline + yy) / scale],
          },
          // {
          //   id: String(Math.random()),
          //   command: "lineTo",
          //   args: [(xx - x) / scale, (baseline + yy) / scale],
          // },
        ];
        replaceCommands({
          ids: [...commands.ids, ...points.map((p) => p.id)],
          items: points.reduce(
            (acc, command) => ({
              ...acc,
              [command.id]: command,
            }),
            {} as Record<string, Command>
          ),
        });
        const startPoint = vector(e.clientX, e.clientY);

        onMouseMove = (e) => {
          // setDrawingStep("line");
        };
        onMouseUp = (e) => {
          const diffX = Math.abs(e.clientX - startPoint.x);
          const diffY = Math.abs(e.clientY - startPoint.y);
          if (diffX > 0 || diffY > 0) {
          } else {
            const commands = getCommands();

            const xx = e.clientX - box.x;
            const yy = box.y - e.clientY;
            const points: Command[] = [
              {
                id: String(Math.random()),
                command: "lineTo",
                args: [(xx - x) / scale, (baseline + yy) / scale],
              },
            ];
            replaceCommands({
              ids: [...commands.ids, ...points.map((p) => p.id)],
              items: points.reduce(
                (acc, command) => ({
                  ...acc,
                  [command.id]: command,
                }),
                {} as Record<string, Command>
              ),
            });
            setDrawingStep("line");
          }
          element.removeEventListener("mousemove", onMouseMove);
          element.removeEventListener("mouseup", onMouseUp);
        };
        element.addEventListener("mousemove", onMouseMove);
        element.addEventListener("mouseup", onMouseUp);
      };
      element.addEventListener("mousedown", onMouseDown);
    } else if (drawing.step === "line") {
      onMouseMove = (e) => {
        const commands = getCommands();
        const command = commands.items[commands.ids[commands.ids.length - 1]];
        const xx = e.clientX - box.x;
        const yy = box.y - e.clientY;
        updateCommands({
          [command.id]: {
            ...command,
            args: [(xx - x) / scale, (baseline + yy) / scale],
          },
        });
      };

      onMouseUp = (e) => {
        const commands = getCommands();
        const xx = e.clientX - box.x;
        const yy = box.y - e.clientY;
        const points: Command[] = [
          {
            id: String(Math.random()),
            command: "lineTo",
            args: [(xx - x) / scale, (baseline + yy) / scale],
          },
        ];
        replaceCommands({
          ids: [...commands.ids, ...points.map((p) => p.id)],
          items: points.reduce(
            (acc, command) => ({
              ...acc,
              [command.id]: command,
            }),
            {} as Record<string, Command>
          ),
        });

        console.log("up");

        // console.log("up");
        // const commands = getCommands();
        // const command = commands.items[commands.ids[commands.ids.length - 1]];

        // const points: Command[] = [
        //   {
        //     id: String(Math.random()),
        //     command: "bezierCurveToCP1",
        //     args: command.args,
        //   },
        //   {
        //     id: String(Math.random()),
        //     command: "bezierCurveToCP2",
        //     args: command.args,
        //   },
        //   {
        //     id: String(Math.random()),
        //     command: "bezierCurveTo",
        //     args: command.args,
        //   },
        // ];
        // replaceCommands({
        //   ids: [
        //     ...commands.ids.slice(0, commands.ids.length - 1),
        //     ...points.map((p) => p.id),
        //   ],
        //   items: points.reduce(
        //     (acc, command) => ({
        //       ...acc,
        //       [command.id]: command,
        //     }),
        //     {} as Record<string, Command>
        //   ),
        // });

        // setDrawingStep("curve");
      };

      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", onMouseUp);
    };
  }, [scale, x, baseline, drawing]);

  return drawing;
}
