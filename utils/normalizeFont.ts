import { applyToPoint, Matrix } from "@free-transform/core";
import { Command } from "../types";
import makeCubicPayload from "./makeCubicPayload";
import normalize from "./normalize";
import quadraticToQubic from "./quadraticToCubic";

export default function normalizeFont(font: any) {
 
  return {
    ...font,
    xHeight: -font.xHeight,
    capHeight: -font.capHeight,
    descent: -font.descent,
    ascent: -font.ascent,
    glyphs: normalize(font.glyphs, (glyph: any) => {
      const commands = glyph.path.commands
        .reduce((acc: Command[], command: Command, index: number) => {
          if (command.command === "quadraticCurveTo") {
          } else if (command.command == "quadraticCurveToCP") {
            acc.push(
              ...makeCubicPayload(
                quadraticToQubic(acc[acc.length - 1].args, [
                  command.args[0],
                  command.args[1],
                  glyph.path.commands[index + 1].args[0],
                  glyph.path.commands[index + 1].args[1],
                ])
              )
            );
          } else {
            acc.push(command);
          }

          return acc;
        }, [] as Command[])
        .map((command: Command) => {
          if (!command.args.length) {
            return command;
          }
          const flipY = (): Matrix => [
            [1, 0, 0, 0],
            [0, -1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ];

          if (command.args.length) {
            command.args = applyToPoint(flipY(), command.args);
          }

          return command;
        });

      return {
        ...glyph,
        path: {
          ...glyph.path,
          commands: normalize(commands),
        },
      };
    }),
  };
}
