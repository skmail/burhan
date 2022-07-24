import { Command, Handle } from "../types";
const getValue = (
  handle: Handle,
  index: 0 | 1,
  type: Handle["type"],
  defaultValue: number
) => {
  return handle.type == type ? handle.points[index] : defaultValue;
};

export default function updateCommand(handle: Handle, command: Command) {
  switch (command.command) {
    case "bezierCurveTo":
      command = {
        ...command,
        args: [
          getValue(handle, 0, "cubicBezier1", command.args[0]),
          getValue(handle, 1, "cubicBezier1", command.args[1]),
          getValue(handle, 0, "cubicBezier2", command.args[2]),
          getValue(handle, 1, "cubicBezier2", command.args[3]),
          getValue(handle, 0, "point", command.args[4]),
          getValue(handle, 1, "point", command.args[5]),
        ],
      };

    case "lineTo":
    case "moveTo":
      command = {
        ...command,
        args: [handle.points[0], handle.points[1]],
      };
      break;
    case "quadraticCurveTo":
      command = {
        ...command,
        args: [
          getValue(handle, 0, "quadraticBezier", command.args[0]),
          getValue(handle, 1, "quadraticBezier", command.args[1]),
          getValue(handle, 0, "point", command.args[2]),
          getValue(handle, 1, "point", command.args[3]),
        ],
      };
      break;
    default:
  }

  return command;
}
