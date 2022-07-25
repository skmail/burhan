import { Command } from "../types";

export default function computePathCommands(
  commands: Command[],
  x = 0,
  y = 0,
  scale = 1,
  scaleX = scale
) {
  return commands.map((command) => {
    let args = command.args;

    if (args.length) {
      args = [x + args[0] * scaleX, y + -args[1] * scale];
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
