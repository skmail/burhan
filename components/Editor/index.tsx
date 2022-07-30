import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  Font,
  onCommandsUpdate,
  PointTuple,
  Settings,
  Guideline as GuidelineType,
  OnCommandsAdd,
} from "../../types";
import { Stage, Layer, Path, Group } from "react-konva";
import commandsToPath from "../../utils/commandsToPathData";
import Metrics from "./Metrics";
import Handles from "./Handles";
import { MinusIcon, PlusIcon } from "@heroicons/react/solid";
import PanningArea from "./PanningArea";
import Guideline from "./Guideline";
import Preview from "./Preview";
import Button from "../Button";
import SelectionArea from "./SelectionArea";
import Grid from "./Grid";
import { HistoryManager } from "../../types/History";
import useFresh from "../../hooks/useFresh";
import { useKeyboard } from "../../context/KeyboardEventsProvider";
import useHandleDrag from "./hooks/useHandleDrag";
import useDrawingPen from "./hooks/useDrawingPen";
import useBounnds from "./hooks/useBounds";
import useZoom from "./hooks/useZoom";

import useHighlightNewPoint from "./hooks/useHighlightNewPoint";
import Handle from "./Handle";
import useInsertPoint from "./hooks/useInsertPoint";

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"]["items"][0];
  onCommandsUpdate: onCommandsUpdate;

  selectedHandles: string[];
  onSelectHandles: (ids: string[]) => void;
  settings: Settings;
  history: HistoryManager;
  onCommandsAdd: OnCommandsAdd;
}
function Editor({
  font,
  glyph,
  onCommandsUpdate,

  selectedHandles,
  onSelectHandles,
  settings,
  history,
  onCommandsAdd,
}: Props) {
  const [hoveredCommands, setHoveredCommands] = useState<string[]>([]);
  const [activeCommands, setActiveCommands] = useState<string[]>([]);

  const [isHoveringHandle, setIsHoveringHandle] = useState(false);

  const [guidelines, setGuidelines] = useState<GuidelineType[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const bounds = useBounnds(ref);

  const [pan, setPan] = useState<PointTuple>([0, 0]);

  const {
    zoom,
    updateZoom,
    reset: resetZoom,
  } = useZoom({
    workspaceRef: ref,
    setPan,
    pan,
  });

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

  const data = useMemo(() => commandsToPath(commandsArray), [commandsArray]);

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
    ...commandsArray,
  ];

  const toCanvasPoint = (_x: number, _y: number) => {
    return [x + _x * scale, baseline - _y * scale];
  };

  const getSelectedHandlesId = useFresh(selectedHandles);

  const getFreshCommands = useFresh(glyph.path.commands);

  const { keys } = useKeyboard();

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
    let _items: Record<string, Command> = { ...commands.items };

    while (queue.length > 0) {
      const id = queue.shift() as string;

      if (result.includes(id)) {
        continue;
      }

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
          if (next) {
            if ("bezierCurveToCP1" === next.command) {
              result.push(ids[nextIndex + 1], ids[nextIndex + 2]);
            }

            if (next.command !== "closePath") {
              items[next.id] = {
                ...next,
                command: "moveTo",
              };
            }
          }
      }

      _items = {
        ...commands.items,
        ...items,
      };

      ids = ids.filter((id) => !result.includes(id));

      // heal the path

      for (let index = 0; index < ids.length; index++) {
        const prev = _items[ids[index - 1]];

        if (
          _items[ids[index]].command === "closePath" &&
          (!prev || prev.command === "closePath")
        ) {
          result.push(ids[index]);
        }
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

  const { isDrawing, data: drawingData } = useDrawingPen({
    x,
    baseline,
    scale,
    workspaceRef: ref,
    scaleWithoutZoom,
    onCommandsAdd: onCommandsAdd,
    commands: glyph.path.commands,
  });

  const { highlightNewPoint, newPoint, resetNewPoint, getNewPoint } =
    useHighlightNewPoint({
      x,
      scale,
      baseline,
      commands: glyph.path.commands,
    });

  const insertPoint = useInsertPoint({
    commands: glyph.path.commands,
    onCommandsAdd: onCommandsAdd,
  });

  const onHandleHover = useCallback((isHover: boolean) => {
    setIsHoveringHandle(isHover);
    resetNewPoint();
  }, []);

  const onHandleActivate = useCallback(
    (id: string) => {
      if (isDrawing) {
        const command: Command = {
          id: String(Math.random()),
          command: "closePath",
          // @ts-ignore
          args: [],
        };

        onCommandsAdd({
          ids: [...getFreshCommands().ids, command.id],
          items: {
            [command.id]: command,
          },
        });
        return;
      }
      setIsDragging(true);
      setActiveCommands((ids) => {
        return [...ids, id];
      });
    },
    [isDrawing]
  );

  const onCommandHover = useCallback((ids: string[]) => {
    setHoveredCommands(ids);
  }, []);

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
              resetZoom();
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
        handles={commandsArray}
        workspaceRef={ref}
        x={x}
        baseline={baseline}
        scale={scale}
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
        onMouseMove={(e) => {
          if (!ref.current || isDragging || isHoveringHandle) {
            return;
          }
          const box = ref.current.getBoundingClientRect();
          highlightNewPoint([e.evt.clientX - box.x, e.evt.clientY - box.y]);
        }}
        width={bounds.width}
        height={bounds.height}
      >
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
            {!!drawingData && (
              <Path
                data={drawingData}
                strokeWidth={settings.viewMode === "outline" ? 2 : 0}
                stroke="#3b82f6"
                fill={settings.viewMode !== "outline" ? "#3b82f6" : undefined}
              />
            )}
            <Path
              x={x}
              y={baseline}
              data={data}
              scaleX={scale}
              scaleY={-scale}
              strokeWidth={
                settings.viewMode === "outline" ? 2 / (scale || 0.1) : 0
              }
              stroke="#3b82f6"
              fill={settings.viewMode !== "outline" ? "#3b82f6" : undefined}
            />
            {!!newPoint && (
              <>
                <Handle
                  scale={scale}
                  baseline={baseline}
                  x={x}
                  index={0}
                  handles={commandsArray}
                  onDrag={(e) => {
                    console.log("drag", e);
                  }}
                  handle={{
                    id: "new",
                    command: "lineTo",
                    args: [newPoint.point.x, newPoint.point.y],
                  }}
                  onDragEnd={onDragEnd}
                  onActivate={() => {
                    const newPoint = getNewPoint();
                    if (!newPoint) {
                      return;
                    }
                    const id = insertPoint(newPoint);
                    console.log("id", id);

                    resetNewPoint();
                  }}
                  isSelected={false}
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
              baseline={baseline}
              x={x}
              onSelect={onHandleSelected}
              onHover={onHandleHover}
              handles={commandsArray}
              selectedHandles={selectedHandles}
              scale={scale}
              onActivate={onHandleActivate}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              hovered={hoveredCommands}
              active={activeCommands}
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
            data={data}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default memo(Editor);
