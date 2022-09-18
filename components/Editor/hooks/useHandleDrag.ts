import { useCallback, useRef, useState } from "react";

import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";

import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import {
  Settings,
  OnHandleDrag,
  Font,
  PointTuple,
  SnapResult,
  Command,
  Table,
  Ruler,
} from "../../../types";
import computeAngle from "../../../utils/computeAngle";
import computeDistance from "../../../utils/computeDistance";
import reflect from "../../../utils/reflect";
import snap from "../../../utils/snap";
import { useSnapPoints } from "./useSnapPoints";

interface Props {
  scale: number;
  scaleWithoutZoom: number;
  settings: Settings;
}

export default function useHandleDrag({
  scaleWithoutZoom,
  scale,
  settings,
}: Props) {
  const setGuidelines = useWorkspaceStore((state) => state.setGuidelines);
  const [getScaleWithoutZoom] = useFresh(scaleWithoutZoom);
  const [getScale] = useFresh(scale);
  const [getSettings] = useFresh(settings);

  const getFreshCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const updateCommands = useFontStore((state) => state.updateCommands);

  const getSelectedHandleIds = useFreshSelector<string[]>(
    useCommandStore,
    (state) => state.selected
  );

  const [isDragging, setIsDragging] = useState(false);

  const cacheCommands = useRef<Table<Command> | undefined>(undefined);

  const getSnapPoints = useSnapPoints();

  const onDrag: OnHandleDrag = useCallback((handle, options = {}) => {
    if (!useFontStore.getState().snapshot) {
      useFontStore.getState().updateSnapshot(getFreshCommands());
    }

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
    const amountToMove = [handle.args[0] / scale, handle.args[1] / scale];

    const getSelectionAndRelations = (
      command: Command,
      index: number,
      commands: Table<Command>
    ) => {
      const acc: string[] = [];
      if (command.command === "bezierCurveTo") {
        if (
          commands.items[commands.ids[index - 1]].command === "bezierCurveToCP2"
        ) {
          acc.push(commands.ids[index - 1]);
        }

        if (commands.items[commands.ids[index + 1]]?.command === "closePath") {
          for (let i = commands.ids.length - 1; i >= 0; i--) {
            console.log(commands.items[commands.ids[i]]?.command);
            if (commands.items[commands.ids[i]]?.command === "moveTo") {
              acc.push(commands.ids[i]);
              acc.push(
                ...getSelectionAndRelations(
                  commands.items[commands.ids[i]],
                  i,
                  commands
                )
              );
              break;
            }
          }
        }
      } else if (command.command === "lineTo") {
        const nextPoint = commands.items[commands.ids[index + 1]];
        if (nextPoint && nextPoint.command === "bezierCurveToCP1") {
          acc.push(nextPoint.id);
        }
      }

      if (
        commands.items[commands.ids[index + 1]]?.command === "bezierCurveToCP1"
      ) {
        acc.push(commands.ids[index + 1]);
      }

      return acc;
    };
    const selections = getSelectedHandleIds().reduce((acc, id) => {
      if (acc.includes(id) || !commands.items[id]) {
        return acc;
      }

      acc.push(id);
      const index = commands.ids.indexOf(id);

      return [
        ...acc,
        ...getSelectionAndRelations(commands.items[id], index, commands),
      ];
    }, [] as string[]);

    const command = commands.items[handle.id];
    let xy: PointTuple = [
      command.args[0] + amountToMove[0],
      command.args[1] - amountToMove[1],
    ];

    let snapped: SnapResult = {
      command: "none",
      args: xy,
      fromPoints: [],
    };

    if (options.allowSnap) {
      const snapPoints = getSnapPoints();

      snapped = snap(
        {
          ...handle,
          args: xy,
        },
        //@ts-ignore
        snapPoints,
        scale,
        scaleWithoutZoom,
        settings.snapToGrid ? settings.gridSize : 0,
        settings.snapToOtherPoints
      );

      if (snapped.command !== "none" && snapped.fromPoints) {
        setGuidelines(
          snapped.fromPoints.map((p) => ({
            id: p.id,
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
        args = [...xy];
      } else {
        args = [
          cmd.args[0] + amountToMove[0] + snapDiff[0],
          cmd.args[1] - amountToMove[1] + snapDiff[1],
        ];
      }
      if (cmd.command !== "closePath") {
        acc[id] = {
          ...cmd,
          args,
        };
      }
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
  }, []);

  const onDragEnd = useCallback(() => {
    useFontStore.getState().commitSnapshotToHistory();
    useFontStore.getState().updateSnapshot();
    cacheCommands.current = undefined;
    setIsDragging(false);
    setGuidelines([]);
  }, []);

  return {
    isDragging,
    onDrag,
    onDragEnd,
    setIsDragging,
  };
}
