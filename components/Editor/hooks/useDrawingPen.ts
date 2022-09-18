import {
  getAngle,
  getDistance,
  toDegree,
  toRadians,
} from "@free-transform/core";
import { useEffect, RefObject } from "react";
import shallow from "zustand/shallow";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Command, PointTuple, Projection, Table } from "../../../types";
import computeAngle from "../../../utils/computeAngle";
import computeDistance from "../../../utils/computeDistance";
import { convertCommand } from "../../../utils/convertCommand";
import { deleteCommands } from "../../../utils/deleteCommands";
import { getMidpoint } from "../../../utils/getMidpoint";
import makeCubicPayload from "../../../utils/makeCubicPayload";
import normalize from "../../../utils/normalize";
import { projectCommand } from "../../../utils/projectCommand";
import reflect from "../../../utils/reflect";
import snap from "../../../utils/snap";
import toGlyphPoint from "../../../utils/toGlyphPoint";
import { useSnapPoints } from "./useSnapPoints";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  workspaceRef: RefObject<HTMLDivElement>;
}

const getBestProjection = (projection: Projection): PointTuple => {
  if (projection.point.t !== undefined && projection.point.t < 0.05) {
    return projection.lastMoveTo.args;
  }
  return [projection.point.x, projection.point.y];
};

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
  const getSnapPoints = useSnapPoints();

  const cursor = useCommandStore((state) => {
    if (state.hovered.length) {
      return "";
      const commands = selectCommandsTable(useFontStore.getState());
      for (let id of state.hovered) {
        const command = commands.items[id];

        if (command && command.command === "moveTo") {
          return "close";
        }
      }

      return "add";
    }
  });

  useEffect(() => {
    if (cursor === "close") {
      document.body.style.cursor = "url(/icons/pen-close.png), auto";
    } else if (cursor === "add") {
      document.body.style.cursor = "url(/icons/pen-add.svg), auto";
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [cursor]);

  const isExit = useWorkspaceStore((state) => state.keyboard.Escape);
  const isDelete = useWorkspaceStore((state) => state.keyboard.Backspace);

  useEffect(() => {
    if (isExit) {
      const commands = getCommands();
      const command = commands.items[commands.ids[commands.ids.length - 1]];
      replaceCommands(deleteCommands(getCommands(), [command.id]));

      useWorkspaceStore.getState().setGuidelines([]);
      useWorkspaceStore.getState().disableDrawing();
    }
  }, [isExit]);

  useEffect(() => {
    if (!isDelete) {
      return;
    }

    const commands = getCommands();
    const command = commands.items[commands.ids[commands.ids.length - 1]];
    replaceCommands(deleteCommands(getCommands(), [command.id]));
    if (command.command === "moveTo") {
      useWorkspaceStore.getState().setGuidelines([]);
      useWorkspaceStore.getState().disableDrawing();
    }
  }, [isDelete]);

  const [getPointers] = useFresh({
    scale,
    x,
    baseline,
  });
  useEffect(() => {
    if (!workspaceRef.current || !drawing.enabled) {
      return;
    }
    const element = workspaceRef.current;
    const box = useWorkspaceStore.getState().bounds;
    let isDown = false;
    let isStarted = false;
    let startPoint: PointTuple = [0, 0];
    let snapPoints: Command[] = [];
    let isFirst = true;
    const onMouseDown = (e: MouseEvent) => {
      startPoint = [e.clientX, e.clientY];
      isDown = true;
      const { x, scale, baseline } = getPointers();


      //@ts-ignore
      snapPoints = getSnapPoints();

      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;
      const point = toGlyphPoint([xx, yy], [x, baseline], scale);

      const commands = getCommands();
      if (!isStarted) {
        const points: Command[] = [
          {
            id: String(Math.random()),
            command: "moveTo",
            args: point,
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
      }
      isStarted = true;
    };

    let shouldSyncCurves = false;

    let projection: any;
    const onMouseMove = (e: MouseEvent) => {
      if (!isStarted) {
        return;
      }
      const { x, scale, baseline } = getPointers();

      useWorkspaceStore.getState().setGuidelines([]);

      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;

      const isLockedToDegree = e.shiftKey;
      const lockToDegree = isLockedToDegree ? 45 : 0.01;

      let degree = toDegree(getAngle(startPoint, [e.clientX, e.clientY])) - 90;
      degree = Math.round(degree / lockToDegree) * lockToDegree;
      const lockedAngle = toRadians(degree);

      let point = toGlyphPoint([xx, yy], [x, baseline], scale);

      const commands = getCommands();
      let command = commands.items[commands.ids[commands.ids.length - 1]];

      const getLockedPoint = (
        prev: PointTuple,
        point: PointTuple
      ): PointTuple => {
        if (!isLockedToDegree) {
          return point;
        }
        const r = getDistance(prev, point);
        const xx = [r * Math.sin(lockedAngle), r * Math.cos(lockedAngle)];

        return [prev[0] + xx[0], prev[1] + xx[1]];
      };

      const toUpdate: Table<Command> = {
        ids: [...commands.ids],
        items: {},
      };

      if (getDistance(startPoint, [e.pageX, e.pageY]) < 2) {
        return;
      }

      if (command.command === "moveTo") {
        if (isDown) {
          const payload = normalize(
            makeCubicPayload([
              command.args[0],
              command.args[1],
              command.args[0],
              command.args[1],
              command.args[0],
              command.args[1],
            ])
          );

          toUpdate.ids = [...toUpdate.ids, ...payload.ids];
          toUpdate.items = {
            ...toUpdate.items,
            ...payload.items,
          };
        } else {
          let command: Command = {
            id: String(Math.random()),
            command: "lineTo",
            args: point,
          };
          toUpdate.ids = [...toUpdate.ids, command.id];
          toUpdate.items[command.id] = command;
        }
      } else {
        if (isDown) {
          if (command.command === "lineTo") {
            const prev = commands.items[commands.ids[commands.ids.length - 2]];

            const payload = makeCubicPayload([
              ...getMidpoint(prev.args, command.args, 0.25),
              ...command.args,
              ...point,
            ]);

            const r = convertCommand(command, payload, commands);
            toUpdate.ids = r.ids;
            toUpdate.items = r.items;
            shouldSyncCurves = true;
          } else if (command.command === "bezierCurveTo") {
            const cmd =
              commands.items[
                commands.ids[commands.ids.length - (isFirst ? 3 : 2)]
              ];

            let reflected = isFirst
              ? getLockedPoint(command.args, point)
              : reflect(getLockedPoint(command.args, point), command.args);

            const snapped = snap(
              {
                ...cmd,
                args: reflected,
              },
              snapPoints,
              scale,
              1,
              20,
              true
            );
            reflected = snapped.args;
            if (snapped.command !== "none" && snapped.fromPoints) {
              useWorkspaceStore.getState().setGuidelines(
                snapped.fromPoints.map((p) => ({
                  id: p.id,
                  command: p.command,
                  points: [
                    snapped.args[0],
                    snapped.args[1],
                    p.args[0],
                    p.args[1],
                  ],
                }))
              );
            }

            if (shouldSyncCurves) {
              const prevLine =
                commands.items[commands.ids[commands.ids.length - 4]];
              const controlPoint =
                commands.items[commands.ids[commands.ids.length - 3]];

              const angle = computeAngle(point, command.args);
              const d = computeDistance(reflected, command.args) * 0.35;

              const mid = getMidpoint(prevLine.args, command.args, 0.25);
              const xx = mid[0] + d * Math.cos(angle);
              const yy = mid[1] + d * Math.sin(angle);
              toUpdate.items[controlPoint.id] = {
                ...controlPoint,
                args: [
                  controlPoint.args[0] + (xx - controlPoint.args[0]),
                  controlPoint.args[1] + (yy - controlPoint.args[1]),
                ],
              };
            }

            toUpdate.items[cmd.id] = {
              ...cmd,
              args: reflected,
            };
          }
        } else {
          if (command.command === "bezierCurveTo") {
            const prev4 = commands.items[commands.ids[commands.ids.length - 4]];
            const prev2 = commands.items[commands.ids[commands.ids.length - 3]];
            const prev = commands.items[commands.ids[commands.ids.length - 2]];

            const dragMain =
              prev2.args[0] === prev4.args[0] &&
              prev2.args[1] === prev4.args[1];

            projection = projectCommand(commands, point, 10 / scale, 0, [
              command.id,
              prev2.id,
              prev.id,
            ]);

            command = {
              ...command,
            };

            if (projection) {
              point = getBestProjection(projection);
            }

            point = getLockedPoint(prev2.args, point);

            const snapped = snap(
              {
                ...command,
                args: point,
              },
              snapPoints,
              scale,
              1,
              20,
              true,
              [command.id, prev.id]
            );
            point = snapped.args;
            if (snapped.command !== "none" && snapped.fromPoints) {
              useWorkspaceStore.getState().setGuidelines(
                snapped.fromPoints.map((p) => ({
                  id: p.id,
                  command: p.command,
                  points: [
                    snapped.args[0],
                    snapped.args[1],
                    p.args[0],
                    p.args[1],
                  ],
                }))
              );
            }
            toUpdate.items[command.id] = {
              ...command,
              args: point,
            };
            if (!dragMain) {
              toUpdate.items[prev.id] = {
                ...prev,
                args: point,
              };

              shouldSyncCurves =
                toUpdate.items[prev.id].args[0] === prev4.args[0] &&
                toUpdate.items[prev.id].args[0] === prev4.args[0];
            }
          } else {
            const prev = commands.items[commands.ids[commands.ids.length - 2]];

            let cmd = {
              ...command,
              args: point,
            };

            projection = projectCommand(commands, cmd.args, 10 / scale, 0, [
              cmd.id,
            ]);

            if (projection) {
              cmd.args = getBestProjection(projection);
            }

            cmd.args = getLockedPoint(prev.args, cmd.args);

            const snapped = snap(cmd, snapPoints, scale, 1, 20, true);

            cmd.args = snapped.args;

            if (snapped.command !== "none" && snapped.fromPoints) {
              useWorkspaceStore.getState().setGuidelines(
                snapped.fromPoints.map((p) => ({
                  id: p.id,
                  command: p.command,
                  points: [
                    snapped.args[0],
                    snapped.args[1],
                    p.args[0],
                    p.args[1],
                  ],
                }))
              );
            }
            toUpdate.items[cmd.id] = cmd;
            shouldSyncCurves = false;
          }
        }
      }

      replaceCommands(toUpdate);
    };
    const onMouseUp = (e: MouseEvent) => {
      const { x, scale, baseline } = getPointers();

      const xx = e.clientX - box.x;
      const yy = e.clientY - box.y;
      let point = toGlyphPoint([xx, yy], [x, baseline], scale);
      isDown = false;
      const wasFirst = isFirst;
      isFirst = false;
      shouldSyncCurves = false;
      const commands = getCommands();
      const command = commands.items[commands.ids[commands.ids.length - 1]];

      const hasProjection =
        projection &&
        projection.lastMoveTo?.command === "moveTo" &&
        projection.point.t < 0.1;

      if (hasProjection) {
        let command: Command = {
          id: String(Math.random()),
          command: "closePath",
          //@ts-ignore
          args: [],
        };
        replaceCommands({
          ids: [...commands.ids, command.id],
          items: {
            [command.id]: command,
          },
        });
        useWorkspaceStore.getState().setGuidelines([]);
        useWorkspaceStore.getState().disableDrawing();
        return;
      }

      if (command.command === "closePath") {
        useWorkspaceStore.getState().setGuidelines([]);
        useWorkspaceStore.getState().disableDrawing();
        return;
      }

      if (command.command === "bezierCurveTo") {
        if (wasFirst) {
          return;
        }

        const prev = commands.items[commands.ids[commands.ids.length - 2]];
        const payload = normalize(
          makeCubicPayload([
            ...point,
            ...reflect(prev.args, prev.args),
            ...point,
          ])
        );
        replaceCommands({
          ids: [...commands.ids, ...payload.ids],
          items: payload.items,
        });
        shouldSyncCurves = true;
      } else {
        let command: Command = {
          id: String(Math.random()),
          command: "lineTo",
          args: point,
        };
        replaceCommands({
          ids: [...commands.ids, command.id],
          items: {
            [command.id]: command,
          },
        });
      }
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
