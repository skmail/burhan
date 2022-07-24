interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Handle {
  id: string;
  points: [number, number];
  type: "point" | "cubicBezier1" | "cubicBezier2" | "quadraticBezier";
}

export type OnHandleDrag = (handle: Handle) => void;

export interface Bounds {
  width: number;
  height: number;
}
export interface Command {
  command:
    | "moveTo"
    | "lineTo"
    | "quadraticCurveTo"
    | "bezierCurveTo"
    | "closePath";

  args: number[];

  id: string;
}

export interface Path {
  commands: Command[];
}

interface Glyph {
  path: Path;
  string: string;
  bbox: Box;
  advanceWidth: number;
  id: string;
}
export interface Font {
  ascent: number;
  descent: number;
  capHeight: number;
  lineGap: number;
  xHeight: number;
  bbox: Box;
  glyphs: Glyph[];

  unitsPerEm: number;
}
