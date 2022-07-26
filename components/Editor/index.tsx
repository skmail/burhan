import { useEffect, useRef, useState } from "react";
import {
  Bounds,
  Command,
  Font,
  OnCommandUpdate,
  onCommandsUpdate,
  PointTuple,
  Settings,
} from "../../types";
import { Stage, Layer, Path, Group } from "react-konva";
import commandsToPath from "../../utils/commandsToPathData";
import Metrics from "./Metrics";
import computePathCommands from "../../utils/computePathCommands";
import Handles from "./Handles";
import { ArrowsExpandIcon, MinusIcon, PlusIcon } from "@heroicons/react/solid";
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

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"]["items"][0];
  onCommandUpdate: OnCommandUpdate;
  onCommandsUpdate: onCommandsUpdate;
  forceUpdate?: string;
  selectedHandles: string[];
  onSelectHandles: (ids: string[]) => void;
  settings: Settings;
  history: HistoryManager;
}
export default function Editor({
  font,
  glyph,
  onCommandUpdate,
  onCommandsUpdate,
  forceUpdate,
  selectedHandles,
  onSelectHandles,
  settings,
  history,
}: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const [guidelines, setGuidelines] = useState<
    {
      command: string;
      points: [number, number, number, number];
    }[]
  >([]);

  const ref = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState<PointTuple>([0, 0]);

  const updateZoom = (value: number) => {
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
  }, [forceUpdate]);

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

  const commandsArray = glyph.path.commands.ids.map(
    (id) => glyph.path.commands.items[id]
  );

  const commands = computePathCommands(commandsArray, x, baseline, scale);
  const data = commandsToPath(commands);

  const handles = commands.filter((comd) => comd.args.length);

  const points = [
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
    ...handles.map((handle) => {
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

  const selectedHandlesRef = useRef<string[]>([]);
  selectedHandlesRef.current = selectedHandles;
  const pendingDragHistory = useRef<
    HistoryCommandUpdate | HistoryCommandsUpdate
  >();

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
        onSelectHandles={(ids) => onSelectHandles(ids)}
        handles={handles}
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
      <Stage width={bounds.width} height={bounds.height}>
        <Layer>
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
            <Handles
              onSelect={(id) => {
                onSelectHandles([id]);
              }}
              handles={handles}
              selectedHandles={selectedHandles}
              onDrag={(handle) => {
                const command = glyph.path.commands.items[handle.id];
                const amountToMove = [
                  handle.args[0] / scale,
                  handle.args[1] / scale,
                ];

                let xy: PointTuple = [
                  command.args[0] + amountToMove[0],
                  command.args[1] + amountToMove[1],
                ];

                const snapped = snap(
                  {
                    ...handle,
                    args: xy,
                  },
                  (points as any).filter(
                    (p: any) => !selectedHandlesRef.current.includes(p.id)
                  ),
                  scale,
                  scaleWithoutZoom,
                  settings.snapToGrid ? settings.gridSize : 0,
                  settings.snapToOtherPoints
                );

                if (snapped.command !== "none" && snapped.fromPoints) {
                  setGuidelines(
                    snapped.fromPoints.map((p) => ({
                      command: p.command,
                      points: [
                        snapped.args[0],
                        snapped.args[1],
                        p.args[0],
                        p.args[1],
                      ],
                    }))
                  );
                } else {
                  setGuidelines((lines) => (lines.length ? [] : lines));
                }

                const snapDiff = [
                  snapped.args[0] - xy[0],
                  snapped.args[1] - xy[1],
                ];

                xy = snapped.args;

                if (selectedHandlesRef.current.length > 1) {
                  const newHandles = selectedHandlesRef.current.reduce(
                    (acc, id) => {
                      const cmd = glyph.path.commands.items[id] as Command;
                      let args: PointTuple;
                      if (id === handle.id) {
                        args = xy;
                      } else {
                        args = [
                          cmd.args[0] + amountToMove[0] + snapDiff[0],
                          cmd.args[1] + amountToMove[1] + snapDiff[1],
                        ];
                      }
                      return {
                        ...acc,
                        [id]: {
                          ...cmd,
                          args,
                        },
                      };
                    },
                    {} as Record<string, Command>
                  );

                  onCommandsUpdate(newHandles);

                  console.log(pendingDragHistory.current?.payload);
                  pendingDragHistory.current = {
                    type: "commands.update",
                    payload: {
                      old: pendingDragHistory.current
                        ? pendingDragHistory.current.payload.old
                        : selectedHandles.reduce(
                            (acc, id) => ({
                              ...acc,
                              [id]: glyph.path.commands.items[id],
                            }),
                            {} as Record<string, Command>
                          ),
                      new: newHandles,
                    },
                  } as HistoryCommandsUpdate;
                } else {
                  const cmd: Command = {
                    ...command,
                    args: xy,
                  };
                  onCommandUpdate(cmd);
                  pendingDragHistory.current = {
                    type: "command.update",
                    payload: {
                      //@ts-ignore
                      old: pendingDragHistory.current
                        ? pendingDragHistory.current.payload.old
                        : command,
                      new: cmd,
                    },
                  } as HistoryCommandUpdate;
                }
              }}
              onDragEnd={() => {
                setGuidelines([]);
                if (pendingDragHistory.current) {
                  history.addToHistory(pendingDragHistory.current);
                  pendingDragHistory.current = undefined;
                }
              }}
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
          viewMode={settings.viewMode === "outline" ? "solid" :"outline"}
          glyph={glyph} commands={commandsArray} font={font} />
        </Layer>
      </Stage>
    </div>
  );
}
