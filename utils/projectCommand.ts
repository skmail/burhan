import { Bezier } from "bezier-js";
import { Command, Table } from "../types";
import { computePointOnBezierCurve } from "./computePointOnBezierCurve";

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
      console.log(command);
      throw new Error(`Command [${command.command}] is not supported.`);
  }
};

export function projectCommand(
  commands: Table<Command>,
  userPoint: [number, number],
  maxDistance: number,
  percentage: number,
  exclude: string[] = []
) {
  let lastMoveTo: Command | undefined;

  for (let index = 0; index < commands.ids.length; index++) {
    const id = commands.ids[index];

    if (exclude.includes(id)) {
      continue;
    }

    const command = commands.items[id];

    const point = [command.args[0], command.args[1]];

    let bz: Bezier;

    switch (command.command) {
      case "moveTo":
        lastMoveTo = command;
        continue;
      case "lineTo":
        {
          const nextPoint = getCommandPoint(commands.ids[index - 1], commands);
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

    const result = computePointOnBezierCurve(bz, userPoint, percentage);

    if (result && result.distance < maxDistance) {
      return {
        lastMoveTo,
        point: result.point,
        command,
      };
    }
  }
}
