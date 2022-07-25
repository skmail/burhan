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
  onSelect: () => void;
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

  const onMouseDown: KonvaNodeEvents["onMouseDown"] = (e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    let startX = e.evt.pageX;
    let startY = e.evt.pageY;
    setIsDragging(true);
    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const movedX = e.pageX - startX;
      const movedY = startY - e.pageY;
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
    fill: isSelected ? "#e11d48" : "white",
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
  };

  return (
    <>
      {handle.command === "quadraticCurveToCP" && (
        <Group>
          <Line
            points={[
              handles[index - 1].args[0],
              handles[index - 1].args[1],
              handle.args[0],
              handle.args[1],
            ]}
            strokeWidth={1}
            stroke={"#b91c1c"}
            dash={[4, 4]}
          />

          <Line
            points={[
              handles[index + 1].args[0],
              handles[index + 1].args[1],
              handles[index].args[0],
              handles[index].args[1],
            ]}
            strokeWidth={1}
            stroke={"#b91c1c"}
            dash={[4, 4]}
          />
        </Group>
      )}

      {handle.command === "bezierCurveToCP2" && (
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

      {handle.command === "bezierCurveToCP1" && (
        <Line
          points={[
            handles[index + 1].args[0],
            handles[index + 1].args[1],
            handles[index].args[0],
            handles[index].args[1],
          ]}
          strokeWidth={1}
          stroke={"#b91c1c"}
          dash={[4, 4]}
        />
      )}

      {!["lineTo", "moveTo"].includes(handle.command) && (
        <Circle {...props} radius={4} />
      )}
      {["lineTo", "moveTo"].includes(handle.command) && (
        <Rect
          {...props}
          x={props.x}
          y={props.y}
          width={8}
          height={8}
          rotation={40}
          offsetX={4}
          offsetY={4}
          onClick={onSelect}
        />
      )}
    </>
  );
}
