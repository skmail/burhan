import { SetStateAction, useCallback, useMemo, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useAppDispatch } from "../../../hooks/store";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";

import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import {
  Settings,
  OnHandleDrag,
  Font,
  PointTuple,
  SnapResult,
  Command,
  Guideline,
  Table,
} from "../../../types";
import { HistoryCommandsUpdate, HistoryManager } from "../../../types/History";
import computeAngle from "../../../utils/computeAngle";
import computeDistance from "../../../utils/computeDistance";
import reflect from "../../../utils/reflect";
import snap from "../../../utils/snap";

interface Props {
  scale: number;
  scaleWithoutZoom: number;
  settings: Settings;

  snapPoints: Command[];
  setGuidelines: (guidelines: SetStateAction<Guideline[]>) => void;
  history: HistoryManager;
}
export default function useHandleDrag({
  scaleWithoutZoom,
  scale,
  settings,

  snapPoints,
  setGuidelines,

  history,
}: Props) {
  const [getScaleWithoutZoom] = useFresh(scaleWithoutZoom);
  const [getScale] = useFresh(scale);
  const [getSettings] = useFresh(settings);

  const getFreshCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const updateCommands = useFontStore((state) => state.updateCommands);

  const selections = useCommandStore((state) => state.selected, shallow);
  const [getSelectedHandleIds] = useFresh(selections);

  const [isDragging, setIsDragging] = useState(false);
  const [getSnapPoints] = useFresh(snapPoints);

  const pendingDragHistory = useRef<HistoryCommandsUpdate>();

  const cacheCommands = useRef<Table<Command> | undefined>(undefined);

  const onDrag: OnHandleDrag = useCallback((handle, options = {}) => {
    options = {
      allowSnap: true,
      ...options,
    };

    if (!cacheCommands.current) {
      cacheCommands.current = getFreshCommands();
    }

    const scale = getScale();
    const scaleWithoutZoom = getScaleWithoutZoom();
    const settings = getSettings();
    const commands = cacheCommands.current;
    const selections = getSelectedHandleIds().reduce((acc, id) => {
      if (acc.includes(id)) {
        return acc;
      }
      const command = commands.items[id];
      acc.push(id);
      const index = commands.ids.indexOf(command.id);
      if (command.command === "bezierCurveTo") {
        acc.push(commands.ids[index + 1], commands.ids[index - 1]);
      } else if (command.command === "lineTo") {
        const nextPoint = commands.items[commands.ids[index + 1]];
        if (nextPoint && nextPoint.command === "bezierCurveToCP1") {
          acc.push(nextPoint.id);
        }
      }
      return acc;
    }, [] as string[]);

    const command = commands.items[handle.id];

    const amountToMove = [handle.args[0] / scale, handle.args[1] / scale];

    let xy: PointTuple = [
      command.args[0] + amountToMove[0],
      command.args[1] + amountToMove[1],
    ];

    let snapped: SnapResult = {
      command: "none",
      args: xy,
      fromPoints: [],
    };

    if (options.allowSnap) {
      const snapPoints = [...(getSnapPoints() as any)];
      for (let id of cacheCommands.current.ids) {
        if (selections.includes(id)) {
          continue;
        }
        snapPoints.push(commands.items[id]);
      }

      snapped = snap(
        {
          ...handle,
          args: xy,
        },
        snapPoints,
        scale,
        scaleWithoutZoom,
        settings.snapToGrid ? settings.gridSize : 0,
        settings.snapToOtherPoints
      );

      if (snapped.command !== "none" && snapped.fromPoints) {
        setGuidelines(
          snapped.fromPoints.map((p) => ({
            command: p.command,
            points: [snapped.args[0], snapped.args[1], p.args[0], p.args[1]],
          }))
        );
      } else {
        setGuidelines([]);
      }
    }

    const snapDiff = [snapped.args[0] - xy[0], snapped.args[1] - xy[1]];

    xy = snapped.args;

    const newHandles = selections.reduce((acc, id) => {
      if (acc[id]) {
        return acc;
      }
      const cmd = commands.items[id];

      if (!cmd) {
        return acc;
      }
      let args: PointTuple;
      if (id === handle.id) {
        args = xy;
      } else {
        args = [
          cmd.args[0] + amountToMove[0] + snapDiff[0],
          cmd.args[1] + amountToMove[1] + snapDiff[1],
        ];
      }

      acc[id] = {
        ...cmd,
        args,
      };

      const getPoint = (
        index1: number,
        index2: number,
        commands: Font["glyphs"]["items"]["0"]["path"]["commands"],
        type: Command["command"],
        args: PointTuple,
        mirrorType: Settings["vectorMirrorType"]
      ): Command | undefined => {
        const pointId = commands.ids[index1];
        let point = acc[pointId] || commands.items[pointId];
        const nextPointId = commands.ids[index2];
        let nextPoint = commands.items[nextPointId];

        if (!nextPoint) {
          return;
        }
        if (nextPoint.command === type) {
          if (mirrorType === "angleLength") {
            args = reflect(args, point.args);
          } else if (mirrorType === "angle") {
            const angle = computeAngle(point.args, args);

            const d = computeDistance(point.args, nextPoint.args);

            const xx = point.args[0] + d * Math.cos(angle);
            const yy = point.args[1] + d * Math.sin(angle);

            args = [xx, yy];

            args = reflect(args, point.args, nextPoint.args);
          } else {
            return;
          }

          return {
            ...nextPoint,
            args,
          };
        }
      };

      const index = commands.ids.indexOf(cmd.id);

      if (cmd.command === "bezierCurveToCP1") {
        const nextPoint = getPoint(
          index - 1,
          index - 2,
          commands,
          "bezierCurveToCP2",
          args,
          settings.vectorMirrorType
        );

        if (nextPoint) {
          acc[nextPoint.id] = nextPoint;
        }
      }

      if (cmd.command === "bezierCurveToCP2") {
        const nextPoint = getPoint(
          index + 1,
          index + 2,
          commands,
          "bezierCurveToCP1",
          args,
          settings.vectorMirrorType
        );

        if (nextPoint) {
          acc[nextPoint.id] = nextPoint;
        }
      }

      return acc;
    }, {} as Record<string, Command>);

    updateCommands(newHandles);

    pendingDragHistory.current = {
      type: "commands.update",
      payload: {
        old: pendingDragHistory.current
          ? pendingDragHistory.current.payload.old
          : Object.keys(newHandles).reduce(
              (acc, id) => ({
                ...acc,
                [id]: getFreshCommands().items[id],
              }),
              {} as Record<string, Command>
            ),
        new: newHandles,
      },
    } as HistoryCommandsUpdate;
  }, []);

  const onDragEnd = useCallback(() => {
    cacheCommands.current = undefined;
    setIsDragging(false);
    setGuidelines([]);
    if (pendingDragHistory.current) {
      history.addToHistory(pendingDragHistory.current);
      pendingDragHistory.current = undefined;
    }
  }, []);

  return {
    isDragging,
    onDrag,
    onDragEnd,
    setIsDragging,
  };
}
