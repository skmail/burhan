import { Command } from "../types";

export default function computePathCommands(
  commands: Command[],
  x = 0,
  y = 0,
  scale = 1
) {
  return commands.map((command) => {
    let args = command.args;

    switch (command.command) {
      case "moveTo":
        args = [x + args[0] * scale, y + -args[1] * scale];
        break;

      case "lineTo":
        args = [x + args[0] * scale, y + -args[1] * scale];
        break;

      case "quadraticCurveTo":
        args = [
          x + args[0] * scale,
          y + -args[1] * scale,
          x + args[2] * scale,
          y + -args[3] * scale,
        ];
        break;

      case "bezierCurveTo": 
        args = [
          x + args[0] * scale,
          y + -args[1] * scale,
          x + args[2] * scale,
          y + -args[3] * scale,
          x + args[4] * scale,
          y + -args[5] * scale,
        ];
        break;
    }

    return {
      ...command,
      args: args.map((arg) => {
        arg = Math.round(arg * 100) / 100;
        return arg;
      }),
    };
  });
}
