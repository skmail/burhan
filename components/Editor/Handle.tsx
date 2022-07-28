import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Line, KonvaNodeEvents, Text, Group, Rect } from "react-konva";

import useFresh from "../../hooks/useFresh";

import { Command, OnHandleActivate, OnHandleDrag, Vector } from "../../types";
import vector2 from "../../utils/vector";

interface Props {
  handle: Command;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  index: number;
  handles: Command[];
  isSelected?: boolean;
  onSelect: (deselect?: boolean) => void;
  onActivate: OnHandleActivate;

  onHover: (isHover: boolean) => void;
}

export default function Handle({
  handle,
  onDrag,
  onDragEnd,
  index,
  handles,
  isSelected = false,
  onSelect,
  onActivate,
  onHover,
}: Props) {
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);

  useEffect(() => {
    onHover(isHover);
  }, [isHover]);

  const getIsSelected = useFresh(isSelected);
  const getIsDraggingStarted = useFresh(isDraggingStarted);
  const getIsDragging = useFresh(isDragging);

  const startPosition = useRef<Vector>(vector2());

  const onMouseMove = useCallback((e: MouseEvent) => {
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
  }, []);

  const onMouseUp = () => {
    if (!getIsDraggingStarted()) {
      onSelect();
    }
    setIsDragging(false);
    setIsHover(false);
    onDragEnd();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    setTimeout(() => setIsDraggingStarted(false), 500);
  };

  const onMouseDown = useCallback((e: any) => {
    if (e.evt.button !== 0) {
      return;
    }
    onActivate(handle);
    e.evt.preventDefault();
    e.evt.stopPropagation();

    startPosition.current.x = e.evt.clientX;
    startPosition.current.y = e.evt.clientY;

    if (!getIsSelected()) {
      onSelect();
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const onMouseEnter: KonvaNodeEvents["onMouseEnter"] = useCallback(
    (e: any) => {
      setIsHover(true);
      const stage = e.target.getStage();

      if (!stage) {
        return;
      }
      document.body.style.cursor = "pointer";
    },
    []
  );
  const onMouseLeave = useCallback((e: any) => {
    if (getIsDragging()) {
      return;
    }
    setIsHover(false);

    const stage = e.target.getStage();

    if (!stage) {
      return;
    }

    document.body.style.cursor = "default";
  }, []);

  const props = {
    // @ts-ignore
    stroke: isSelected
      ? "white"
      : isHover
      ? "#3b82f6"
      : handle.command === "moveTo"
      ? "red"
      : "#9ca3af",
    strokeWidth: isHover ? 2 : 1,
    x: handle.args[0],
    y: handle.args[1],
    fill: isSelected ? "#3b82f6" : "white",

    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
  };

  const isControlPoint = ["bezierCurveToCP1", "bezierCurveToCP2"].includes(
    handle.command
  );

  return (
    <>
      {handle.command === "quadraticCurveToCP" && (
        <Group>
          <Line
            points={[
              handle.args[0],
              handle.args[1],
              handles[index - 1].args[0],
              handles[index - 1].args[1],
            ]}
            strokeWidth={1}
            stroke={"#3b82f6"}
            dash={isHover || isDragging ? undefined : [4, 4]}
          />

          <Line
            points={[
              handles[index].args[0],
              handles[index].args[1],
              handles[index + 1].args[0],
              handles[index + 1].args[1],
            ]}
            strokeWidth={1}
            stroke={"#3b82f6"}
            dash={isHover || isDragging ? undefined : [4, 4]}
          />
        </Group>
      )}
      {handle.command === "bezierCurveToCP1" && (
        <Line
          points={[
            handles[index - 1].args[0],
            handles[index - 1].args[1],
            handles[index].args[0],
            handles[index].args[1],
          ]}
          strokeWidth={1}
          stroke={"#3b82f6"}
          dash={isHover || isDragging ? undefined : [4, 4]}
        />
      )}
      {handle.command === "bezierCurveToCP2" && (
        <Line
          points={[
            handles[index].args[0],
            handles[index].args[1],
            handles[index + 1].args[0],
            handles[index + 1].args[1],
          ]}
          strokeWidth={1}
          stroke={"#3b82f6"}
          dash={isHover || isDragging ? undefined : [4, 4]}
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
}
