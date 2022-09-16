export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
  t?: number;
}

export type OnHandleActivate = (id: string) => void;
export type OnHandleDrag = (
  handle: Command,
  options?: {
    allowSnap?: boolean;
  }
) => void;
export type OnCommandUpdate = (command: Command) => void;
export type onCommandsUpdate = (commands: Record<string, Command>) => void;

export type OnCommandsAdd = (
  table: Font["glyphs"]["items"]["0"]["path"]["commands"]
) => void;

export type PointTuple = [number, number];
export interface Bounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

export type Transform = {
  translateX?: number;
  translateY?: number;
  rotation?: number;
  scale?: number;
  skewX?: number;
  skewY?: number;
};

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
  args: PointTuple;
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
  codePoint: number;
  codePoints: number[];
  _metrics: {
    leftBearing: number;
  };
}

export interface Table<T> {
  ids: string[];
  items: Record<string, T>;
}
export interface Font {
  id: string;
  ascent: number;
  descent: number;
  capHeight: number;
  lineGap: number;
  xHeight: number;
  bbox: Box;
  glyphs: Table<Glyph>;
  unitsPerEm: number;

  postscriptName: string;
  fullName: string;
  familyName: string;
  subfamilyName: string;
  copyright: string;
  version: number;
}

export type ViewMode = "outline" | "solid";

export interface Settings {
  gridSize: number;
  snapToGrid: boolean;
  snapToOtherPoints: boolean;
  viewMode: ViewMode;
  vectorMirrorType: "none" | "angle" | "angleLength";
}

export interface Vector {
  x: number;
  y: number;
  t?: number;
}

export interface SnapResult {
  command: string;
  args: PointTuple;
  fromPoints: {
    command: string;
    args: PointTuple;
  }[];
}

export interface Guideline {
  command: string;
  points: [number, number, number, number];
}

export interface NewPoint {
  command: Command;
  point: Point;
}

export interface Ruler {
  id: string;
  position: number;
  direction: "vertical" | "horizontal";
}

export type TransformDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export type TransformHandle = "warp" | "rotate" | "scale";
