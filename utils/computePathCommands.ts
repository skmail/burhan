import { Command, PointTuple } from "../types";
const round = (value: number) => Math.round(value * 100) / 100;

export default function computePathCommands(
  commands: Command[],
  x = 0,
  y = 0,
  scale = 1,
  scaleX = scale
): Command[] { 

  return commands.map((command) => {
    if (command.command === "closePath") {
      return command;
    }
    const args: PointTuple = [
      round(x + command.args[0] * scaleX),
      round(y + -command.args[1] * scale),
    ];
    return {
      ...command,
      args,
    };
  });
}
