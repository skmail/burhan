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
import { Stage, Layer, Path, Group, Rect } from "react-konva";
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
import useHandleDrag from "./hooks/useHandleDrag";
import useDrawingPen from "./hooks/useDrawingPen";
import useBounnds from "./hooks/useBounds";
import useZoom from "./hooks/useZoom";

import useHighlightNewPoint from "./hooks/useHighlightNewPoint";
import Handle from "./Handle";
import useInsertPoint from "./hooks/useInsertPoint";
import { Provider, shallowEqual, useStore } from "react-redux";

import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import useKeyboardMove from "./hooks/useKeyboardMove";
import useDeletePoints from "./hooks/useDeletePoints";

import Ruler from "./Ruler";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import shallow from "zustand/shallow";

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
    (Math.min(height, width) - 120);

  const scale = scaleWithoutZoom * zoom;

  const initialX = width / 2 - (glyph.advanceWidth / 2) * scaleWithoutZoom;

  const x = width / 2 + pan[0] - (glyph.advanceWidth / 2) * scale;

  const baseline =
    height / 2 + pan[1] + ((font.ascent + font.descent) / 2) * scale;

  const data = useFontStore((state) => {
    const commands = selectCommandsTable(state);
    return commandsToPath(commands.ids.map((id) => commands.items[id]));
  });

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
      args: [glyph.advanceWidth, 0],
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
  ];

  const toCanvasPoint = (_x: number, _y: number) => {
    return [x + _x * scale, baseline - _y * scale];
  };

  const [getFreshCommands] = useFresh(glyph.path.commands);

  const keys = useWorkspaceStore((state) => state.keyboard, shallow);

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

  useDeletePoints();

  const { onDrag, onDragEnd, isDragging, setIsDragging } = useHandleDrag({
    scaleWithoutZoom,
    scale,
    settings,
    snapPoints: points,
    setGuidelines,
    history,
  });

  useKeyboardMove({
    settings,
    zoom,
    onDrag,
    onDragEnd,
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
    },
    [isDrawing]
  );

  const ids = useFontStore(
    (state) => selectCommandsTable(state).ids,
    shallowEqual
  );

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

        {(zoom != 1 || pan[0] != 0 || pan[1] != 0) && (
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
                {/* <Handle
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
                    /> */}
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
              scale={scale}
              baseline={baseline}
              x={x}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              ids={ids}
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
          {/* <Preview
            viewMode={settings.viewMode}
            glyph={glyph}
            commands={commandsArray}
            font={font}
            data={data}
          /> */}
          <Ruler
            scrollPosition={x / scale}
            size={Math.max(width, height)}
            zoom={scale}
          />
          <Ruler
            scrollPosition={baseline / scale}
            size={Math.max(width, height)}
            zoom={scale}
            direction="vertical"
          />
          <Rect width={27} height={27} x={-2} y={-2} fill="black" stroke={"gray"} strokeWidth={1} />
        </Layer>
      </Stage>
    </div>
  );
}

export default memo(Editor);
