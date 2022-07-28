import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bounds,
  Command,
  Font,
  OnCommandUpdate,
  onCommandsUpdate,
  PointTuple,
  Settings,
  Point,
  SnapResult,
  OnHandleDrag,
  Guideline as GuidelineType,
} from "../../types";
import { Stage, Layer, Path, Group, Circle, Text } from "react-konva";
import commandsToPath from "../../utils/commandsToPathData";
import Metrics from "./Metrics";
import computePathCommands from "../../utils/computePathCommands";
import Handles from "./Handles";
import { MinusIcon, PlusIcon } from "@heroicons/react/solid";
import PanningArea from "./PanningArea";
import snap from "../../utils/snap";
import Guideline from "./Guideline";
import Preview from "./Preview";
import Button from "../Button";
import SelectionArea from "./SelectionArea";
import Grid from "./Grid";
import {
  HistoryCommandsUpdate,
  HistoryCommandUpdate,
  HistoryManager,
} from "../../types/History";
import reflect from "../../utils/reflect";
import useFresh from "../../hooks/useFresh";
import computeAngle from "../../utils/computeAngle";
import computeDistance from "../../utils/computeDistance";
import { Bezier } from "bezier-js";
import { useKeyboard } from "../../context/KeyboardEventsProvider";
import useHandleDrag from "./hooks/useHandleDrag";

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"]["items"][0];
  onCommandUpdate: OnCommandUpdate;
  onCommandsUpdate: onCommandsUpdate;

  selectedHandles: string[];
  onSelectHandles: (ids: string[]) => void;
  settings: Settings;
  history: HistoryManager;
  onCommandsAdd: (
    table: Font["glyphs"]["items"]["0"]["path"]["commands"]
  ) => void;
}
export default function Editor({
  font,
  glyph,
  onCommandsUpdate,

  selectedHandles,
  onSelectHandles,
  settings,
  history,
  onCommandsAdd,
}: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const [guidelines, setGuidelines] = useState<GuidelineType[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState<PointTuple>([0, 0]);

  const updateZoom = (value: number) => {
    setNewPoint(undefined);
    setZoom((zoom) => Math.min(10, Math.max(zoom + value, 0.1)));
  };

  useEffect(() => {
    if (!ref.current || !ref.current.parentElement) {
      return;
    }
    const parent = ref.current.parentElement;

    setBounds((bounds) => ({
      ...bounds,
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    }));

    const onResize = () => {
      setBounds((bounds) => ({
        ...bounds,
        width: parent.offsetWidth,
        height: parent.offsetHeight,
      }));
    };

    window.addEventListener("resize", onResize);

    ref.current.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const ZOOM_SENSITIVITY = 500;
      const zoomAmount = -(e.deltaY / ZOOM_SENSITIVITY);
      updateZoom(zoomAmount);
    });

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const w = font.bbox.width;
  const h = font.bbox.height;

  const [zoom, setZoom] = useState(0.9);

  const width = bounds.width;
  const height = bounds.height;

  const scaleWithoutZoom =
    (1 / Math.max(font.ascent - font.descent, glyph.bbox.width)) *
    Math.min(height, width);
  const scale = scaleWithoutZoom * zoom;

  const x = width / 2 + pan[0] - (glyph.bbox.width / 2) * scale;

  const baseline =
    height / 2 + pan[1] + ((font.ascent + font.descent) / 2) * scale;

  const commandsArray = useMemo(
    () => glyph.path.commands.ids.map((id) => glyph.path.commands.items[id]),
    [glyph.path.commands]
  );

  const commands = useMemo(() => {
    return computePathCommands(commandsArray, x, baseline, scale);
  }, [commandsArray, x, baseline, scale]);

  const data = useMemo(() => {
    const data = commandsToPath(commands);

    // console.log(data)

    return data;
  }, [commands]);

  const points: any[] = [
    {
      id: "baseline",
      command: "baseline",
      args: [0, 0],
    },
    {
      id: "x",
      command: "x",
      args: [0, 0],
    },
    {
      id: "width",
      command: "width",
      args: [glyph.advanceWidth || glyph.bbox.width, 0],
    },
    {
      id: "ascent",
      command: "ascent",
      args: [0, font.ascent],
    },
    {
      id: "descent",
      command: "descent",
      args: [0, font.descent],
    },
    {
      id: "xHeight",
      command: "xHeight",
      args: [0, font.xHeight],
    },
    {
      id: "capHeight",
      command: "capHeight",
      args: [0, font.capHeight],
    },
    ...commands.map((handle) => {
      return {
        ...handle,
        args: [
          (handle.args[0] - x) / scale,
          (baseline - handle.args[1]) / scale,
        ],
      };
    }),
  ];

  const toCanvasPoint = (_x: number, _y: number) => {
    return [x + _x * scale, baseline - _y * scale];
  };

  const [newPoint, setNewPoint] = useState<{
    command: Command;
    point: Point;
  }>();

  const getSelectedHandlesId = useFresh(selectedHandles);

  const getFreshCommands = useFresh(glyph.path.commands);

  const { keys } = useKeyboard();

  const getKeyboardKeys = useFresh(keys);

  useEffect(() => {
    if (!newPoint) {
      document.body.style.cursor = "";
    } else {
      document.body.style.cursor = "url(icons/pen-add.svg), auto";
    }
  }, [newPoint]);

  useEffect(() => {
    if (
      !keys.ArrowUp &&
      !keys.ArrowLeft &&
      !keys.ArrowRight &&
      !keys.ArrowDown
    ) {
      return;
    }
    const selections = getSelectedHandlesId();

    if (!selections.length) {
      return;
    }

    const moveUp = () => {
      const firstHandle = getFreshCommands().items[selections[0]];
      const args: PointTuple = [0, 0];
      let a = 1;
      let snap = true;
      if (keys.ShiftLeft) {
        a = settings.gridSize;
      } else if (keys.AltLeft) {
        a = settings.gridSize / 4;
      } else {
        snap = false;
      }

      const amount = a * zoom;

      if (keys.ArrowUp) {
        args[1] += amount;
      }

      if (keys.ArrowLeft) {
        args[0] -= amount;
      }

      if (keys.ArrowRight) {
        args[0] += amount;
      }

      if (keys.ArrowDown) {
        args[1] -= amount;
      }

      onDrag(
        {
          ...firstHandle,
          args,
        },
        {
          allowSnap: snap,
        }
      );

      onDragEnd();
    };

    moveUp();
    const interval = setInterval(() => moveUp(), 200);

    return () => {
      setGuidelines([]);
      clearInterval(interval);
    };
  }, [
    keys.ArrowUp,
    keys.ArrowLeft,
    keys.ArrowRight,
    keys.ArrowDown,
    zoom,
    keys.ShiftLeft,
    keys.AltLeft,
    settings.gridSize,
  ]);

  const onHandleSelected = useCallback(
    (id: string) => {
      if (keys.ShiftLeft && !selectedHandles.includes(id)) {
        onSelectHandles([...selectedHandles, id]);
      } else if (selectedHandles.includes(id)) {
        onSelectHandles(selectedHandles.filter((i) => i !== id));
      } else {
        onSelectHandles([id]);
      }
    },
    [selectedHandles, keys.ShiftLeft]
  );
  useEffect(() => {
    if (!keys.Backspace && !keys.Delete) {
      return;
    }
    const selections = getSelectedHandlesId();

    if (!selections.length) {
      return;
    }
    const commands = getFreshCommands();

    const queue = [...selections];

    const result: string[] = [];

    const items: Record<string, Command> = {};

    let ids = [...commands.ids];

    while (queue.length > 0) {
      const id = queue.shift() as string;

      if (result.includes(id)) {
        continue;
      }

      const _items = {
        ...commands.items,
        ...items,
      };
      const command = _items[id];
      const index = ids.indexOf(id);

      switch (command.command) {
        case "lineTo":
          result.push(id);
          break;
        case "bezierCurveTo":
          result.push(id, ids[index - 1], ids[index - 2]);
          break;
        case "bezierCurveToCP1":
          result.push(id, ids[index + 1], ids[index + 2]);
          break;
        case "bezierCurveToCP2":
          result.push(id, ids[index - 1], ids[index + 1]);
          break;
        case "moveTo":
          result.push(id);
          const nextIndex = index + 1;
          const next = _items[ids[nextIndex]];

          if (!next) {
            continue;
          }

          if ("bezierCurveToCP1" === next.command) {
            result.push(ids[nextIndex + 1], ids[nextIndex + 2]);
          }

          items[next.id] = {
            ...next,
            command: "moveTo",
          };
      }

      ids = ids.filter((id) => !result.includes(id));
    }

    onSelectHandles([]);

    onCommandsAdd({
      ids,
      items,
    });
  }, [keys.Backspace, keys.Delete]);

  const { onDrag, onDragEnd, isDragging, setIsDragging } = useHandleDrag({
    scaleWithoutZoom,
    scale,
    settings,
    commands: glyph.path.commands,
    selectedHandles,
    snapPoints: points,
    setGuidelines,
    onCommandsUpdate,
    history,
  });

  return (
    <div
      className="bg-gray-100 relative"
      style={{
        width: bounds.width,
        height: bounds.height,
      }}
      ref={ref}
    >
      <div className="absolute bottom-2 right-2 flex flex-col z-50 space-y-2 items-end">
        <div className="text-xs w-full py-1 px-2 bg-black bg-opacity-90 text-white rounded-md">
          {Math.round(zoom * 100)}%
        </div>

        {(zoom != 0.9 || pan[0] != 0 || pan[1] != 0) && (
          <Button
            onClick={() => {
              setPan([0, 0]);
              setZoom(0.9);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 12h2V4h-8v2h6v6ZM4 20h8v-2H6v-6H4v8Z" />
              <path d="M22 24H2a2.002 2.002 0 0 1-2-2V2a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v20a2.002 2.002 0 0 1-2 2ZM2 2v20h20.001L22 2H2Z" />
            </svg>
          </Button>
        )}
        <Button onClick={() => updateZoom(0.1)}>
          <PlusIcon className="w-5 h-5" />
        </Button>

        <Button onClick={() => updateZoom(-0.1)}>
          <MinusIcon className="w-5 h-5" />
        </Button>
      </div>

      <PanningArea
        onPan={(x, y) => {
          setPan((pan) => [pan[0] + x, pan[1] + y]);
        }}
      />
      <SelectionArea
        onSelectHandles={(ids) => {
          onSelectHandles(ids);
        }}
        handles={commands}
        workspaceRef={ref}
      />

      <Grid
        size={settings.gridSize}
        zoom={zoom}
        width={width}
        height={height}
        pan={[
          x,
          height / 2 + pan[1] + ((font.ascent + font.descent) / 2) * scale,
        ]}
      />
      <Stage
        onMouseDown={(e) => {
          if (!newPoint) {
            return;
          }

          function insert<T>(arr: T[], index: number, newItem: T[], to = 0) {
            return [
              // part of the array before the specified index
              ...arr.slice(0, index),
              // inserted item
              ...newItem,
              // part of the array after the specified index
              ...arr.slice(index + to),
            ];
          }

          const toX = (v: number) => (v - x) / scale;
          const toY = (v: number) => (baseline - v) / scale;

          const toX1 = (v: number) => v;
          const toY1 = (v: number) => v;

          const toBzCommands = (p1: Point, p2: Point, p3: Point) => {
            return [
              {
                id: String(Math.random()),
                command: "bezierCurveToCP1",
                //@ts-ignore
                args: [toX1(p1.x), toY1(p1.y)],
              },
              {
                id: String(Math.random()),
                command: "bezierCurveToCP2",
                //@ts-ignore

                args: [toX1(p2.x), toY1(p2.y)],
              },
              {
                id: String(Math.random()),
                command: "bezierCurveTo",
                //@ts-ignore
                args: [toX1(p3.x), toY1(p3.y)],
              },
            ];
          };

          const freshCommands = getFreshCommands();
          const index = freshCommands.ids.indexOf(newPoint.command.id);
          const p = freshCommands.items[newPoint.command.id];

          let bz: Bezier;

          if (newPoint.command.command === "lineTo") {
            const lineTo: Command = {
              command: "lineTo",
              id: String(Math.random()),
              args: [toX(newPoint.point.x), toY(newPoint.point.y)],
            };

            const ids = insert(freshCommands.ids, index, [lineTo.id]);
            onCommandsAdd({
              ids: ids,
              items: {
                [lineTo.id]: lineTo,
              },
            });
          } else if (newPoint.command.command === "closePath") {
            const index = freshCommands.ids.length - 1;
            const lineTo: Command = {
              command: "lineTo",
              id: String(Math.random()),
              args: [toX(newPoint.point.x), toY(newPoint.point.y)],
            };

            const ids = insert(freshCommands.ids, index, [lineTo.id]);

            onCommandsAdd({
              ids: ids,
              items: {
                [lineTo.id]: lineTo,
              },
            });

            return;
          } else if (newPoint.command.command === "bezierCurveTo") {
            const cp3 = freshCommands.items[freshCommands.ids[index - 3]];
            const cp1 = freshCommands.items[freshCommands.ids[index - 2]];
            const cp2 = freshCommands.items[freshCommands.ids[index - 1]];

            if (!cp1 || !cp2) {
              return;
            }

            bz = new Bezier(
              cp3.args[0],
              cp3.args[1],

              cp1.args[0],
              cp1.args[1],

              cp2.args[0],
              cp2.args[1],

              p.args[0],
              p.args[1]
            );

            const result = bz.split(newPoint.point.t || 1);

            const newCommands = [
              ...toBzCommands(
                result.left.points[1],
                result.left.points[2],
                result.left.points[3]
              ),
              ...toBzCommands(
                result.right.points[1],
                result.right.points[2],
                result.right.points[3]
              ),
            ];

            let ids = insert(
              freshCommands.ids,
              index - 2,
              newCommands.map((c) => c.id),
              3
            );

            onCommandsAdd({
              ids,
              items: newCommands.reduce(
                (acc, item) => ({
                  ...acc,
                  [item.id]: item,
                }),
                {}
              ),
            });
          } else {
            return;
          }
        }}
        onMouseMove={(e) => {
          if (!ref.current || isDragging || isHoveringHandle) {
            return;
          }

          // lift this but not now
          const box = ref.current.getBoundingClientRect();
          const pos: PointTuple = [
            e.evt.clientX - box.x,
            e.evt.clientY - box.y,
          ];

          const round = getKeyboardKeys()["ShiftLeft"] !== true;

          const computePointOnBezierCurve = (bz: Bezier) => {
            const m = bz.project({
              x: pos[0],
              y: pos[1],
            });

            const distance = computeDistance([m.x, m.y], pos);
            let t = m.t || 0;

            if (round) {
              const inv = 1.0 / 0.25;
              t = Math.round(t * inv) / inv;
            }

            const p = bz.get(t);

            return {
              distance,
              point: {
                ...p,
                t,
              },
            };
          };

          for (let index = 0; index < commands.length; index++) {
            const aroundPoints: PointTuple[] = [];

            const command = commands[index];
            const p = [command.args[0], command.args[1]];

            let result: any;

            if (command.command === "lineTo") {
              const prev = commands[index - 1];
              const pr: PointTuple = [prev.args[0], prev.args[1]];
              aroundPoints.push(pr);
              const space = [(p[0] - pr[0]) / 2, (p[1] - pr[1]) / 2];
              result = computePointOnBezierCurve(
                new Bezier(
                  pr[0],
                  pr[1],

                  pr[0] + space[0],
                  pr[1] + space[1],

                  p[0] - space[0],
                  p[1] - space[1],

                  p[0],
                  p[1]
                )
              );
            } else if (command.command === "bezierCurveTo") {
              const cp3 = commands[index - 3];
              const cp2 = commands[index - 2];
              const cp1 = commands[index - 1];

              if (!cp1 || !cp2 || !cp3) {
                continue;
              }
              aroundPoints.push(cp1.args, cp2.args, cp3.args);

              result = computePointOnBezierCurve(
                new Bezier(
                  cp3.args[0],
                  cp3.args[1],

                  cp2.args[0],
                  cp2.args[1],

                  cp1.args[0],
                  cp1.args[1],
                  p[0],
                  p[1]
                )
              );
            } else if (command.command === "closePath") {
              const pr = commands[0].args;
              const p = commands[index - 1].args;

              aroundPoints.push(pr, p);

              const space = [(p[0] - pr[0]) / 2, (p[1] - pr[1]) / 2];
              result = computePointOnBezierCurve(
                new Bezier(
                  pr[0],
                  pr[1],

                  pr[0] + space[0],
                  pr[1] + space[1],

                  p[0] - space[0],
                  p[1] - space[1],

                  p[0],
                  p[1]
                )
              );
            } else {
              // console.log(command.command);
              continue;
            }

            aroundPoints.push(command.args);

            const maxDistance = 5;
            if (result && result.distance < maxDistance) {
              const d = aroundPoints.filter((p) => {
                return (
                  computeDistance(p, [result.point.x, result.point.y]) * zoom <
                  maxDistance
                );
              });

              if (d.length > 0) {
                setNewPoint(undefined);
                return;
              }

              setNewPoint({
                point: result.point,
                command,
              });

              return;
            }
          }

          setNewPoint(undefined);
        }}
        width={bounds.width}
        height={bounds.height}
      >
        <Layer className="asxx">
          <Metrics
            width={bounds.width}
            height={bounds.height}
            ascent={font.ascent}
            descent={font.descent}
            xHeight={font.xHeight}
            capHeight={font.capHeight}
            scale={scale}
            baseline={baseline}
            x={x}
            advanceWidth={glyph.advanceWidth}
          />

          <Group opacity={1}>
            <Path
              data={data}
              strokeWidth={settings.viewMode === "outline" ? 2 : 0}
              stroke="#3b82f6"
              fill={settings.viewMode !== "outline" ? "#3b82f6" : undefined}
            />
            {!!newPoint && (
              <>
                <Circle
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="white"
                  x={newPoint.point.x}
                  y={newPoint.point.y}
                  radius={5}
                />
                {/* 
                <Text
                  fontSize={11}
                  text={`[${newPoint.index}] ${Math.round(
                    newPoint.point.x
                  )},${Math.round(newPoint.point.y)} `}
                  x={newPoint.point.x}
                  y={newPoint.point.y - 14}
                ></Text> */}
              </>
            )}
            <Handles
              onSelect={onHandleSelected}
              onHover={(isHover) => {
                setIsHoveringHandle(isHover);
                setNewPoint(undefined);
              }}
              handles={commands}
              selectedHandles={selectedHandles}
              onActivate={() => {
                setIsDragging(true);
              }}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
            />
          </Group>

          {guidelines.map((guideline, index) => {
            const origin = toCanvasPoint(
              guideline.points[2],
              guideline.points[3]
            );
            const destination = toCanvasPoint(
              guideline.points[0],
              guideline.points[1]
            );

            if (guideline.command === "x" || guideline.command === "width") {
              origin[1] = 0;
              destination[1] = height;
            } else if (
              [
                "baseline",
                "ascent",
                "descent",
                "xHeight",
                "capHeight",
              ].includes(guideline.command)
            ) {
              origin[0] = 0;
              destination[0] = width;
            }

            return (
              <Guideline
                key={index}
                points={
                  [...destination, ...origin] as [
                    number,
                    number,
                    number,
                    number
                  ]
                }
              />
            );
          })}

          <Preview
            viewMode={settings.viewMode}
            glyph={glyph}
            commands={commandsArray}
            font={font}
          />
        </Layer>
      </Stage>
    </div>
  );
}
