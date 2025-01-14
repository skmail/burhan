import { memo, useCallback, useEffect, useRef, useState } from "react";
import { PointTuple, Settings } from "../../types";
import { Stage, Layer, Group, Rect } from "react-konva";
import Metrics from "./Metrics";
import Handles from "./Handles";
import PanningArea from "./PanningArea";
import Button from "../Button";
import SelectionArea from "./SelectionArea";
import Grid from "./Grid";
import { HistoryManager } from "../../types/History";
import useHandleDrag from "./hooks/useHandleDrag";
import useBounds from "./hooks/useBounds";
import useZoom from "./hooks/useZoom";

import useHighlightNewPoint from "./hooks/useHighlightNewPoint";

import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import useKeyboardMove from "./hooks/useKeyboardMove";
import useDeletePoints from "./hooks/useDeletePoints";

import Ruler from "./Ruler";
import shallow from "zustand/shallow";
import NewInputHandle from "./NewPointHandle";
import useCommandStore from "../../store/commands/reducer";
import Guidelines from "./Guidelines";
import DrawingLayer from "./DrawingLayer";
import RulerLines from "./RulerLines";
import { SceneContext } from "konva/lib/Context";
import TransformControl from "./TransformControl";
import SelectAll from "./SelectAll";
import EnableControlTransform from "./EnableControlTransform";
import { SnapshotPath } from "./SnapshotPath";
import { Path } from "./Path";
import { useTransformStore } from "../../store/transform";
import { ContextMenu } from "./ContextMenu";
import { useWorkspaceStore } from "../../store/workspace/reducer";

interface Props {
  settings: Settings;
  history: HistoryManager;
}

function Editor({ settings, history }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const bounds = useBounds(ref);

  const [pan, setPan] = useState<PointTuple>([0, 0]);

  const { glyph, ...font } = useFontStore(
    (state) => ({
      ascent: state.font.ascent,
      descent: state.font.descent,
      xHeight: state.font.xHeight,
      capHeight: state.font.capHeight,
      glyph: state.font.glyphs.items[state.selectedGlyphId],
      s: state.selectedGlyphId,
    }),
    shallow
  );

  // console.log(font.s)

  const width = bounds.width;
  const height = bounds.height;

  const scaleWithoutZoom =
    (1 / Math.max(Math.abs(font.ascent - font.descent), glyph.bbox.width)) *
    (Math.min(height, width) - 120);

  let x = width / 2 - (glyph.bbox.width / 2) * scaleWithoutZoom;

  let baseline =
    height / 2 - ((font.ascent + font.descent) / 2) * scaleWithoutZoom;

  const {
    zoom,
    updateZoom,
    reset: resetZoom,
  } = useZoom({
    workspaceRef: ref,
    setPan,
    pan,
  });

  x *= zoom;
  x += pan[0];

  baseline *= zoom;
  baseline += pan[1];

  const scale = scaleWithoutZoom * zoom;

  const resetWorkspaceView = useCallback(() => {
    setPan([0, 0]);
    resetZoom();
  }, []);

  useEffect(() => {
    resetWorkspaceView();
  }, [glyph.id]);

  const points: any[] = [
    {
      id: "baseline",
      command: "baseline",
      args: [0, 0],
    },
    {
      id: "x",
      command: "x",
      args: [glyph._metrics.leftBearing, 0],
    },
    {
      id: "width",
      command: "width",
      args: [glyph._metrics.advanceWidth, 0],
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

  useDeletePoints();

  const { onDrag, onDragEnd, isDragging } = useHandleDrag({
    scaleWithoutZoom,
    scale,
    settings,
  });

  useKeyboardMove({
    settings,
    zoom,
    onDrag,
    onDragEnd,
  });

  const { highlightNewPoint, resetNewPoint } = useHighlightNewPoint({
    x,
    scale,
    baseline,
  });

  const ids = useFontStore((state) => selectCommandsTable(state).ids, shallow);

  const shouldResetZoom = zoom != 1 || pan[0] != 0 || pan[1] != 0;

  const isHandleHovered = useCommandStore(
    (state) => state.hovered.length > 0 && !state.hovered.includes("new")
  );

  const hasNewPoint = useFontStore((state) => !!state.newPoint);

  const clipFunction = useCallback(
    (ctx: SceneContext) => {
      ctx.rect(25, 25, width, height);
    },
    [width, height]
  );
  return (
    <div
      className="bg-bg-1 relative transition"
      style={{
        width: bounds.width,
        height: bounds.height,
      }}
      ref={ref}
    >
      <div className="absolute bottom-2 right-2 flex flex-col z-50  items-end">
        <div className="absolute right-full bottom-0 text-xs mr-2 py-1 px-1 bg-black bg-opacity-80 text-white rounded-md">
          {Math.round(zoom * 100)}%
        </div>
        <SelectAll />
        <EnableControlTransform />
        {shouldResetZoom && (
          <Button onClick={resetWorkspaceView} roundedB={false}>
            <svg
              className="w-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.55556 12H5V19H12V17.4444H6.55556V12ZM12 6.55556H17.4444V12H19V5H12V6.55556Z"
                fill="#707C88"
              />
            </svg>
          </Button>
        )}
        <Button
          roundedB={false}
          roundedT={!shouldResetZoom}
          onClick={() => updateZoom(0.1)}
        >
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7354 7.99353H10.2387V10.2387H7.99353V11.7354H10.2387V13.9806H11.7354V11.7354H13.9806V10.2387H11.7354V7.99353Z"
              fill="#707C88"
            />
            <path
              d="M10.9871 5C7.68595 5 5 7.68595 5 10.9871C5 14.2882 7.68595 16.9741 10.9871 16.9741C12.3154 16.9739 13.6055 16.5292 14.6519 15.7109L17.9418 19.0007L19 17.9425L15.7101 14.6526C16.5288 13.6062 16.9738 12.3158 16.9741 10.9871C16.9741 7.68595 14.2882 5 10.9871 5ZM10.9871 15.4774C8.51066 15.4774 6.49677 13.4635 6.49677 10.9871C6.49677 8.51066 8.51066 6.49677 10.9871 6.49677C13.4635 6.49677 15.4774 8.51066 15.4774 10.9871C15.4774 13.4635 13.4635 15.4774 10.9871 15.4774Z"
              fill="#707C88"
            />
          </svg>
        </Button>

        <Button roundedT={false} onClick={() => updateZoom(-0.1)}>
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.99353 10.2387H13.9806V11.7355H7.99353V10.2387Z"
              fill="#707C88"
            />
            <path
              d="M10.9871 16.9741C12.3154 16.9739 13.6055 16.5292 14.6519 15.7109L17.9418 19.0007L19 17.9425L15.7101 14.6526C16.5288 13.6062 16.9738 12.3158 16.9741 10.9871C16.9741 7.68595 14.2882 5 10.9871 5C7.68595 5 5 7.68595 5 10.9871C5 14.2882 7.68595 16.9741 10.9871 16.9741ZM10.9871 6.49677C13.4635 6.49677 15.4774 8.51066 15.4774 10.9871C15.4774 13.4635 13.4635 15.4774 10.9871 15.4774C8.51066 15.4774 6.49677 13.4635 6.49677 10.9871C6.49677 8.51066 8.51066 6.49677 10.9871 6.49677Z"
              fill="#707C88"
            />
          </svg>
        </Button>
      </div>
      <PanningArea
        workspaceRef={ref}
        onPan={(x, y) => {
          setPan((pan) => [pan[0] + x, pan[1] + y]);
        }}
      />

      <Grid
        size={settings.gridSize}
        zoom={zoom}
        width={width}
        height={height}
        pan={[x, baseline]}
      />

      <DrawingLayer
        x={x}
        baseline={baseline}
        scale={scale}
        workspaceRef={ref}
      />

      <Stage
        onContextMenu={(e) => {
          e.evt.preventDefault();
          useWorkspaceStore
            .getState()
            .enableContextMenu("workspace", [e.evt.clientX, e.evt.clientY]);
        }}
        onMouseMove={(e) => {
          if (isHandleHovered && hasNewPoint) {
            resetNewPoint();
            return;
          }
          if (
            !ref.current ||
            isDragging ||
            isHandleHovered ||
            useTransformStore.getState().enabled ||
            useWorkspaceStore.getState().drawing.enabled
          ) {
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
            advanceWidth={glyph._metrics.advanceWidth}
            leftBearing={glyph._metrics.leftBearing}
          />
          
          <Group clipFunc={clipFunction}>
            <SnapshotPath x={x} y={baseline} scale={scale} />
            <Path
              viewMode={settings.viewMode}
              x={x}
              y={baseline}
              scale={scale}
            />
          </Group>
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
          <Rect
            width={27}
            height={27}
            x={-2}
            y={-2}
            fill="#F3F5F7"
            stroke={"#C4CBD7"}
            strokeWidth={2}
          />
          <RulerLines
            height={height}
            width={width}
            x={x}
            baseline={baseline}
            scale={scale}
            scaleWithoutZoom={scaleWithoutZoom}
          />
          <Guidelines
            baseline={baseline}
            width={width}
            scale={scale}
            x={x}
            height={height}
          />
          <Group clipFunc={clipFunction}>
            <NewInputHandle
              zoom={zoom}
              scale={scale}
              x={x}
              baseline={baseline}
            />

            <Handles
              scale={scale}
              baseline={baseline}
              x={x}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              ids={ids}
              zoom={zoom}
            />
          </Group>
          <TransformControl
            scale={scale}
            workspaceRef={ref}
            baseline={baseline}
            initialX={x}
            offset={[bounds.x, bounds.y]}
          />
        </Layer>
      </Stage>
      <SelectionArea
        workspaceRef={ref}
        x={x}
        baseline={baseline}
        scale={scale}
      />

      <ContextMenu />
    </div>
  );
}

export default memo(Editor);
