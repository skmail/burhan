import { applyToPoint, Matrix, Point } from "@free-transform/core";
import opentype from "opentype.js";
import { Font } from "../types";

const flipY = (point: Point) => {
  if (!point.length) {
    return point;
  }
  const flipY = (): Matrix => [
    [1, 0, 0, 0],
    [0, -1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  const p = applyToPoint(flipY(), point);
  return [Number(String(p[0].toFixed(2))), Number(String(p[1].toFixed(2)))];
};
export default function toOpentype(font: Font) {
  const glyphs: opentype.Glyph[] = [
    new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: 650,
      path: new opentype.Path(),
    }),
  ];

  for (let id of font.glyphs.ids) {
    const glyph = font.glyphs.items[id];
    const path = new opentype.Path();

    const commandIds = [...glyph.path.commands.ids];

    if (!commandIds.length) {
      continue;
    }
    while (commandIds.length > 0) {
      const id = commandIds.shift() as string;
      const command = {
        ...glyph.path.commands.items[id],
        args: flipY(glyph.path.commands.items[id].args),
      };

      switch (command.command) {
        case "moveTo":
          path.moveTo(command.args[0], command.args[1]);
          break;

        case "lineTo":
          path.lineTo(command.args[0], command.args[1]);
          break;
        case "closePath":
          path.closePath();
          break;
        case "bezierCurveToCP1":
          const cp2Id = commandIds.shift() as string;
          const pointId = commandIds.shift() as string;

          const cp2 = {
            ...glyph.path.commands.items[cp2Id],
            args: flipY(glyph.path.commands.items[cp2Id].args),
          };
          const point = {
            ...glyph.path.commands.items[pointId],
            args: flipY(glyph.path.commands.items[pointId].args),
          };

          path.bezierCurveTo(
            command.args[0],
            command.args[1],

            cp2.args[0],
            cp2.args[1],

            point.args[0],
            point.args[1]
          );
          break;
      }
    }

    const opentypeGlyph = new opentype.Glyph({
      name: glyph.string,
      unicode: glyph.codePoints[0],
      unicodes: glyph.codePoints,
      advanceWidth: glyph.advanceWidth,
      path,
    });

    glyphs.push(opentypeGlyph);
  }

  // const aPath = new opentype.Path();
  // aPath.moveTo(100, 0);
  // aPath.lineTo(100, 700);
  // // more drawing instructions...
  // const aGlyph = new opentype.Glyph({
  //   name: "A",
  //   unicode: 65,
  //   advanceWidth: 650,
  //   path: aPath,
  // });

  // const glyphs = [notdefGlyph, aGlyph];
  const openTypeFont = new opentype.Font({
    familyName: "XXX",
    styleName: "Medium",
    unitsPerEm: font.unitsPerEm,
    ascender: -font.ascent,
    descender: -font.descent,
    glyphs: glyphs,
  });

  const arrayBuffer = openTypeFont.toArrayBuffer();

  const dataView = new DataView(arrayBuffer);
  const blob = new Blob([dataView], { type: "font/opentype" });

  const url = globalThis.URL.createObjectURL(blob);

  return url;
}
