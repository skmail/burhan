import { Command } from "../types";

const SVG_COMMANDS: Record<Command["command"], string> = {
  moveTo: "M",
  lineTo: "L",
  quadraticCurveTo: "",
  quadraticCurveToCP: "Q",
  bezierCurveTo: "",
  bezierCurveToCP1: "C",
  bezierCurveToCP2: "",
  closePath: "Z",
};

export default function commandsToPathData(commands: Command[]) {
  return commands
    .map(
      (command) => `${SVG_COMMANDS[command.command]}${command.args.join(" ")} `
    )
    .join(" ");
}
