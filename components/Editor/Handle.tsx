import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Line, KonvaNodeEvents, Text, Group, Rect } from "react-konva";
import useFresh from "../../hooks/useFresh";
import {
  selectCommand,
  selectCommandsTable,
  useFontStore,
} from "../../store/font/reducer";
import {
  Command,
  OnHandleActivate,
  OnHandleDrag,
  PointTuple,
  Vector,
} from "../../types";
import vector2 from "../../utils/vector";
import toScreenPoint from "../../utils/toScreenPoint";
import useCommandStore from "../../store/commands/reducer";
import shallow from "zustand/shallow";
import useFreshSelector from "../../hooks/useFreshSelector";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import { clamp } from "@free-transform/core";

interface Props {
  id: string;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  baseline: number;
  x: number;
  scale: number;
  zoom: number;
  onActivate?: OnHandleActivate;
}

const noob = () => {};

export default function Handle({
  id,
  onDrag,
  onDragEnd,
  baseline,
  scale,
  x,
  onActivate = noob,
  zoom,
}: Props) {
  const states = useCommandStore(
    (state) => ({
      isActive: state.active.includes(id),
      isHovered: state.hovered.includes(id),
      isSelected: state.selected.includes(id),
      select: state.select,
      activate: state.activate,
      hover: state.hover,
      unhover: state.unhover,
      toggleSelected: state.toggleSelected,
      deactivate: state.deactivate,
    }),
    shallow
  );

  const handle = useFontStore((state) => {
    if (id === "new" && state.newPoint) {
      return {
        id: "new",
        command: "lineTo",
        args: [state.newPoint.point.x, state.newPoint.point.y],
      } as Command;
    }
    return selectCommand(id)(state);
  }, shallow);

  const [getStates] = useFresh(states);

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);

  const [getIsDraggingStarted] = useFresh(isDraggingStarted);
  const [getIsDragging] = useFresh(isDragging);
  const startPosition = useRef<Vector>(vector2(undefined, undefined));

  const getKeys = useFreshSelector(
    useWorkspaceStore,
    (state) => state.keyboard
  );

  const onMouseDown = useCallback(
    (e: any) => {
      if (e.evt.button !== 0) {
        return;
      }
      e.evt.preventDefault();
      e.evt.stopPropagation();
      // getKeys
      startPosition.current.x = e.evt.clientX;
      startPosition.current.y = e.evt.clientY;
      const states = getStates();

      states.activate(id);
      onActivate(id);
      if (getKeys().ShiftLeft) {
        states.toggleSelected(id);
      } else if (!states.isSelected) {
        states.select(id);
      }
    },
    [id]
  );

  useEffect(() => {
    if (!states.isActive) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!handle) {
        return;
      }

      if (startPosition.current.x === 0 && startPosition.current.y === 0) {
        startPosition.current.x = e.clientX;
        startPosition.current.y = e.clientY;
      }

      e.preventDefault();
      e.stopPropagation();

      const movedX = e.clientX - startPosition.current.x;
      const movedY = startPosition.current.y - e.clientY;

      if (Math.abs(movedX) > 1 && Math.abs(movedY) > 1) {
        setIsDragging(true);
        setIsDraggingStarted(true);
      }

      onDrag({
        ...handle,
        args: [movedX, movedY],
      });
    };
    const onUp = () => {
      if (!getKeys().ShiftLeft && !getIsDraggingStarted()) {
        states.select(id);
      }

      states.deactivate(id);
      onDragEnd();

      setIsDragging(false);
      setTimeout(() => setIsDraggingStarted(false), 500);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [states.isActive]);

  const onMouseEnter: KonvaNodeEvents["onMouseEnter"] = useCallback(
    (e: any) => {
      const stage = e.target.getStage();

      if (!stage) {
        return;
      }
      document.body.style.cursor = "pointer";
      states.hover(id);
    },
    [id]
  );

  const onMouseLeave = useCallback(
    (e: any) => {
      if (getIsDragging()) {
        return;
      }

      const stage = e.target.getStage();

      if (!stage) {
        return;
      }

      document.body.style.cursor = "default";

      states.unhover(id);
    },
    [id]
  );

  const lines = useFontStore((state) => {
    if (!handle) {
      return [];
    }

    const commands = selectCommandsTable(state);

    if (!handle.args.length) {
      return [];
    }
    const index = commands.ids.indexOf(id);

    const lines = [];
    if (handle.command === "bezierCurveToCP1") {
      const p1 = commands.items[commands.ids[index - 1]];
      if (!p1) {
        return [];
      }
      lines.push([
        ...toScreenPoint(p1.args, [x, baseline], scale),
        ...toScreenPoint(handle.args, [x, baseline], scale),
      ]);
    } else if (handle.command == "bezierCurveToCP2") {
      const p1 = commands.items[commands.ids[index + 1]];
      if (!p1) {
        return [];
      }
      lines.push([
        ...toScreenPoint(handle.args, [x, baseline], scale),
        ...toScreenPoint(p1.args, [x, baseline], scale),
      ]);
    }

    return lines;
  }, shallow);

  // stale pro & zombie component
  if (!handle) {
    return null;
  }
  const isControlPoint = ["bezierCurveToCP1", "bezierCurveToCP2"].includes(
    handle.command
  );

  const props = {
    // @ts-ignore
    stroke: states.isSelected
      ? "white"
      : states.isHovered
      ? "#3b82f6"
      : handle.command === "moveTo"
      ? "#4D7FEE"
      : "#4D7FEE",
    strokeWidth: states.isHovered ? 2 : clamp(1 * zoom, 0.3, 1.2),
    x: x + handle.args[0] * scale,
    y: baseline + handle.args[1] * scale,
    fill: states.isSelected ? "#3b82f6" : "white",

    onMouseDown,
    onMouseEnter,
    onMouseLeave,
  };
  if (!handle.args.length) {
    return null;
  }

  return (
    <>
      {lines.map((line, index) => (
        <Line key={index} points={line} strokeWidth={1} stroke={"#C4CBD7"} />
      ))}
      {!isControlPoint && <Circle {...props} radius={clamp(4 * zoom, 3,4)} />}
      {isControlPoint && (
        <Rect
          {...props}
          width={clamp(6 * zoom, 2, 6)}
          height={clamp(6 * zoom, 2, 6)}
          y={props.y - 3}
          x={props.x}
          rotation={45}
          cornerRadius={1}
        />
      )}

      {/* <Text
          fontSize={11}
          text={`[${index}] ${Math.round(props.x)}, ${Math.round(props.y)}`}
          x={handle.args[0]}
          y={handle.args[1] - 15}
          fill="red"
        ></Text> */}
    </>
  );
}
