interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export type OnHandleDrag = (handle: Command) => void;
export type OnCommandUpdate = (command: Command) => void;
export type onCommandsUpdate = (commands: Record<string, Command>) => void;

export type PointTuple = [number, number];
export interface Bounds {
  width: number;
  height: number;
  x: number;
  y: number;
}
export interface Command {
  command:
    | "moveTo"
    | "lineTo"
    | "quadraticCurveTo"
    | "quadraticCurveToCP"
    | "bezierCurveTo"
    | "bezierCurveToCP1"
    | "bezierCurveToCP2"
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
