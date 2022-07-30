import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Circle, Line, KonvaNodeEvents, Text, Group, Rect } from "react-konva";

import useFresh from "../../hooks/useFresh";

import {
  Command,
  OnHandleActivate,
  OnHandleDrag,
  PointTuple,
  Vector,
} from "../../types";
import vector2 from "../../utils/vector";

interface Props {
  handle: Command;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  index: number;
  handles: Command[];
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onActivate?: OnHandleActivate;
  isHovered?: boolean;
  onHover?: (isHover: boolean) => void;
  isActive?: boolean;
  baseline: number;
  x: number;
  scale: number;
}
const noob = () => {};

export default memo(function Handle({
  handle,
  onDrag,
  onDragEnd,
  index,
  handles,
  isSelected = false,
  isHovered = false,
  isActive = false,
  onSelect = noob,
  onActivate = noob,
  onHover = noob,
  baseline,
  scale,
  x,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);

  const getIsSelected = useFresh(isSelected);
  const getIsDraggingStarted = useFresh(isDraggingStarted);
  const getIsDragging = useFresh(isDragging);

  const startPosition = useRef<Vector>(vector2());
  const onMouseDown = useCallback(
    (e: any) => {
      startPosition.current.x = e.evt.clientX;
      startPosition.current.y = e.evt.clientY;

      if (e.evt.button !== 0) {
        return;
      }
      e.evt.preventDefault();
      e.evt.stopPropagation();

      onActivate(handle.id);

      onSelect(handle.id);
    },
    [handle.id]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
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

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [isActive]);
  const onMouseUp = useCallback(() => {
    if (!getIsDraggingStarted()) {
      onSelect(handle.id);
    }
    setIsDragging(false);
    onDragEnd();
    setTimeout(() => setIsDraggingStarted(false), 500);
  }, [handle.id]);

  const onMouseEnter: KonvaNodeEvents["onMouseEnter"] = useCallback(
    (e: any) => {
      // setIsHover(true);
      const stage = e.target.getStage();

      if (!stage) {
        return;
      }
      document.body.style.cursor = "pointer";
      onHover(true);
    },
    [handle.id]
  );

  const onMouseLeave = useCallback(
    (e: any) => {
      if (getIsDragging()) {
        return;
      }
      // setIsHover(false);

      const stage = e.target.getStage();

      if (!stage) {
        return;
      }

      document.body.style.cursor = "default";
      onHover(false);
    },
    [handle.id]
  );

  const props = {
    // @ts-ignore
    stroke: isSelected
      ? "white"
      : isHovered
      ? "#3b82f6"
      : handle.command === "moveTo"
      ? "red"
      : "#9ca3af",
    strokeWidth: isHovered ? 2 : 1,
    x: x + handle.args[0] * scale,
    y: baseline - handle.args[1] * scale,
    fill: isSelected ? "#3b82f6" : "white",

    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
  };

  const isControlPoint = ["bezierCurveToCP1", "bezierCurveToCP2"].includes(
    handle.command
  );

  const toPoint = (
    point: PointTuple,
    x: number,
    baseline: number,
    scale: number
  ) => [x + point[0] * scale, baseline - point[1] * scale];

  return (
    <>
      {handle.command === "bezierCurveToCP1" && (
        <Line
          points={[
            ...toPoint(handles[index - 1].args, x, baseline, scale),
            ...toPoint(handles[index].args, x, baseline, scale),
          ]}
          strokeWidth={1}
          stroke={"#3b82f6"}
          dash={isHovered || isDragging ? undefined : [4, 4]}
        />
      )}
      {handle.command === "bezierCurveToCP2" && (
        <Line
          points={[
            ...toPoint(handles[index].args, x, baseline, scale),
            ...toPoint(handles[index + 1].args, x, baseline, scale),
          ]}
          strokeWidth={1}
          stroke={"#3b82f6"}
          dash={isHovered || isDragging ? undefined : [4, 4]}
        />
      )}
      {!isControlPoint && <Circle {...props} radius={4} />}
      {isControlPoint && (
        <Rect
          {...props}
          width={6}
          height={6}
          y={props.y - 3}
          x={props.x}
          rotation={45}
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
});
