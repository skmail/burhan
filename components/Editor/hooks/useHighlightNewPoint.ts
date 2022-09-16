import { Bezier } from "bezier-js";
import { useCallback } from "react";
import shallow from "zustand/shallow";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Command, PointTuple, Table } from "../../../types";
import computeDistance from "../../../utils/computeDistance";
import toGlyphPoint from "../../../utils/toGlyphPoint";

interface Props {
  x: number;
  baseline: number;
  scale: number;
}

const computePointOnBezierCurve = (
  bz: Bezier,
  pos: PointTuple,
  round: boolean
) => {
  const m = bz.project({
    x: pos[0],
    y: pos[1],
  });

  const distance = computeDistance([m.x, m.y], pos);
  let t = m.t || 0;

  if (round) {
    const inv = 1.0 / 0.25;
    t = Math.min(Math.max(Math.round(t * inv) / inv, 0.25), 0.75);
  }

  const p = bz.get(t);

  return {
    distance,
    point: {
      ...p,
      t,
    },
  };
};

const getCommandPoint = (id: string, commands: Table<Command>) => {
  const command = commands.items[id];

  switch (command.command) {
    case "moveTo":
    case "lineTo":
    case "bezierCurveTo":
      return [command.args[0], command.args[1]];
    case "bezierCurveToCP1": {
      const index = commands.ids.indexOf(id);
      const command = commands.items[commands.ids[index + 2]];
      return [command.args[0], command.args[1]];
    }
    case "bezierCurveToCP2": {
      const index = commands.ids.indexOf(id);
      const command = commands.items[commands.ids[index + 1]];
      return [command.args[0], command.args[1]];
    }
    default:
      throw new Error(`Command [${command.command}] is not supported.`);
  }
};

export default function useHighlightNewPoint({ x, baseline, scale }: Props) {
  const setNewPoint = useFontStore((state) => state.setNewPoint);
  const resetNewPoint = useCallback(() => setNewPoint(undefined), []);
  const keys = useWorkspaceStore((state) => state.keyboard, shallow);
  const [getProps] = useFresh({
    x,
    scale,
    baseline,
    keys,
  });
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const highlightNewPoint = useCallback((coords: PointTuple) => {
    const { x, baseline, scale, keys } = getProps();
    const pos: PointTuple = toGlyphPoint(coords, [x, baseline], scale);
   
    const round = keys.ShiftLeft !== true;
     
    const commands = getCommands();
    let lastMoveTo: Command | undefined;

    for (let index = 0; index < commands.ids.length; index++) {
      const id = commands.ids[index];

      const command = commands.items[id];

      const point = [command.args[0], command.args[1]];

      let bz: Bezier;

      switch (command.command) {
        case "moveTo":
          lastMoveTo = command;
          continue;
        case "lineTo":
          {
            const nextPoint = getCommandPoint(
              commands.ids[index - 1],
              commands
            );
            const space = [
              (point[0] - nextPoint[0]) / 2,
              (point[1] - nextPoint[1]) / 2,
            ];
            bz = new Bezier(
              nextPoint[0],
              nextPoint[1],

              nextPoint[0] + space[0],
              nextPoint[1] + space[1],

              point[0] - space[0],
              point[1] - space[1],

              point[0],
              point[1]
            );

            // console.log(
            //   nextPoint[0],
            //   nextPoint[1],

            //   nextPoint[0] + space[0],
            //   nextPoint[1] + space[1],

            //   point[0] - space[0],
            //   point[1] - space[1],

            //   point[0],
            //   point[1]
            // )
          }
          break;
        case "bezierCurveTo":
          {
            const cp3 = commands.items[commands.ids[index - 3]];
            const cp2 = commands.items[commands.ids[index - 2]];
            const cp1 = commands.items[commands.ids[index - 1]];

            if (!cp1 || !cp2 || !cp3) {
              continue;
            }

            bz = new Bezier(
              cp3.args[0],
              cp3.args[1],

              cp2.args[0],
              cp2.args[1],

              cp1.args[0],
              cp1.args[1],
              point[0],
              point[1]
            );
          }
          break;
        case "closePath":
          {
            if (!lastMoveTo) {
              continue;
            }
            const pr = lastMoveTo.args;
            const p = commands.items[commands.ids[index - 1]].args;

            const space = [(p[0] - pr[0]) / 2, (p[1] - pr[1]) / 2];
            bz = new Bezier(
              pr[0],
              pr[1],

              pr[0] + space[0],
              pr[1] + space[1],

              p[0] - space[0],
              p[1] - space[1],

              p[0],
              p[1]
            );
          }
          break;
        default: {
          continue;
        }
      }

      const result = computePointOnBezierCurve(bz, pos, round);

      const maxDistance = 5 / scale;

      // console.log(x
      //   result,
        
      // )
      
      if (result && result.distance < maxDistance) {
        setNewPoint({
          point: result.point,
          command,
        });

        return;
      }
    }

    setNewPoint(undefined);
  }, []);

  return {
    resetNewPoint,
    highlightNewPoint,
  };
}
