import { Command } from "../types";
import makeCubicPayload from "./makeCubicPayload";
import normalize from "./normalize";
import quadraticToQubic from "./quadraticToCubic";

export default function normalizeFont(font: any) {
  return {
    ...font,
    glyphs: normalize(font.glyphs, (glyph: any) => {
      return {
        ...glyph,
        path: {
          ...glyph.path,
          commands: normalize(
            glyph.path.commands.reduce(
              (acc: Command[], command: Command, index: number) => {
                if (command.command === "quadraticCurveTo") {
                  return acc;
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
              },
              [] as Command[]
            )
          ),
        },
      };
    }),
  };
}
