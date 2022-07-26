import { useState } from "react";
import { Circle, Line, KonvaNodeEvents, Rect, Group } from "react-konva";

import { Command, OnHandleDrag } from "../../types";

interface Props {
  handle: Command;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  index: number;
  handles: Command[];
  isSelected?: boolean;
  onSelect: (deselect?: boolean) => void;
}

export default function Handle({
  handle,
  onDrag,
  onDragEnd,
  index,
  handles,
  isSelected = false,
  onSelect,
}: Props) {
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);

  const onMouseDown: KonvaNodeEvents["onMouseDown"] = (e) => {
    onSelect();
    e.evt.preventDefault();
    e.evt.stopPropagation();
    let startX = e.evt.pageX;
    let startY = e.evt.pageY;
    setIsDragging(true);
    const onMove = (e: MouseEvent) => {
      setIsDraggingStarted(true);
      e.preventDefault();
      e.stopPropagation();
      const movedX = e.clientX - startX;
      const movedY = startY - e.clientY;

      onDrag({
        ...handle,
        args: [movedX, movedY],
      });
    };
    const onUp = () => {
      setIsDragging(false);
      setIsHover(false);
      onDragEnd();
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setTimeout(() => setIsDraggingStarted(false), 400);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const onMouseEnter: KonvaNodeEvents["onMouseEnter"] = (e) => {
    setIsHover(true);
    const stage = e.target.getStage();

    if (!stage) {
      return;
    }
    stage.container().style.cursor = "pointer";
  };
  const onMouseLeave: KonvaNodeEvents["onMouseLeave"] = (e) => {
    if (isDragging) {
      return;
    }
    setIsHover(false);

    const stage = e.target.getStage();

    if (!stage) {
      return;
    }
    stage.container().style.cursor = "default";
  };

  const colors = {
    quadraticBezierPoint: "blue",
    quadraticBezier: "pink",
  };

  const props = {
    // @ts-ignore
    stroke: isHover ? "#3b82f6" : "#9ca3af",
    strokeWidth: 1,
    x: handle.args[0],
    y: handle.args[1],
    fill: isSelected
      ? "#e11d48"
      : handle.command === "bezierCurveTo"
      ? "yellow"
      : handle.command === "bezierCurveToCP1"
      ? "blue"
      : "white",

    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onClick: () => {
      onSelect(!isDraggingStarted);
    },
  };

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
            stroke={"#b91c1c"}
            dash={[4, 4]}
          />

          <Line
            points={[
              handles[index].args[0],
              handles[index].args[1],
              handles[index + 1].args[0],
              handles[index + 1].args[1],
            ]}
            strokeWidth={1}
            stroke={"#b91c1c"}
            dash={[4, 4]}
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
          stroke={"#b91c1c"}
          dash={[4, 4]}
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
          stroke={"#b91c1c"}
          dash={[4, 4]}
        />
      )}

      <Circle {...props} radius={4} />
    </>
  );
}
