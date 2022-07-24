import Guideline from "./components/Editor/GuideLine";

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
  points: PointTuple;
  indexes: PointTuple;
  type:
    | "point"
    | "cubicBezier1"
    | "cubicBezier2"
    | "cubicBezierPoint"
    | "quadraticBezier"
    | "quadraticBezierPoint";
}

export type OnHandleDrag = (handle: Handle) => void;
export type OnCommandUpdate = (command: Command) => void;
export type PointTuple = [number, number];
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
  commands: Table<Command>;
}

interface Glyph {
  path: Path;
  string: string;
  bbox: Box;
  advanceWidth: number;
  id: string;
}

interface Table<T> {
  ids: string[];
  items: Record<string, T>;
}
export interface Font {
  ascent: number;
  descent: number;
  capHeight: number;
  lineGap: number;
  xHeight: number;
  bbox: Box;
  glyphs: Table<Glyph>;
  unitsPerEm: number;
}

