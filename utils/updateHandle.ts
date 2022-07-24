import { Command, Handle } from "../types";
const getValue = (handle: Handle, index: 0 | 1, type: Handle["type"]) => {
  return handle.type == type ? handle.points[index] : 0;
};

export default function updateHandle(handle: Handle, command: Command) {
  switch (command.command) {
    case "bezierCurveTo":
      command = {
        ...command,
        args: [
          command.args[0] + getValue(handle, 0, "cubicBezier1"),
          command.args[1] + getValue(handle, 1, "cubicBezier1"),
          command.args[2] + getValue(handle, 0, "cubicBezier2"),
          command.args[3] + getValue(handle, 1, "cubicBezier2"),
          command.args[4] + getValue(handle, 0, "point"),
          command.args[5] + getValue(handle, 1, "point"),
        ],
      };

    case "lineTo":
    case "moveTo":
      command = {
        ...command,
        args: [
          command.args[0] + handle.points[0],
          command.args[1] + handle.points[1],
        ],
      };
      break;
    case "quadraticCurveTo":
      command = {
        ...command,
        args: [
          command.args[0] + getValue(handle, 0, "quadraticBezier"),
          command.args[1] + getValue(handle, 1, "quadraticBezier"),
          command.args[2] + getValue(handle, 0, "point"),
          command.args[3] + getValue(handle, 1, "point"),
        ],
      };
      break;
    default:
  }

  return command;
}
