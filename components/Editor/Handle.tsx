import { useState } from "react";
import { Circle, Line, KonvaNodeEvents, Rect, Group } from "react-konva";

import { Handle as HandleType, OnHandleDrag } from "../../types";

interface Props {
  handle: HandleType;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  index: number;
  handles: HandleType[];
}

export default function Handle({
  handle,
  onDrag,
  onDragEnd,
  index,
  handles,
}: Props) {
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown: KonvaNodeEvents["onMouseDown"] = (e) => {
    let startX = e.evt.pageX;
    let startY = e.evt.pageY;
    setIsDragging(true);
    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const movedX = e.pageX - startX;
      const movedY = startY - e.pageY;
      onDrag({
        id: handle.id,
        points: [movedX, movedY],
        type: handle.type,
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

  const props = {
    stroke: isHover ? "#3b82f6" : "#9ca3af",
    strokeWidth: 1,
    x: handle.points[0],
    y: handle.points[1],
    fill: "white",
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
  };
  return (
    <>
      {handle.type == "quadraticBezier" && (
        <Group>
          <Line
            points={[
              handles[index - 1].points[0],
              handles[index - 1].points[1],
              handles[index].points[0],
              handles[index].points[1],
            ]}
            strokeWidth={1}
            stroke={"#b91c1c"}
            dash={[4, 4]}
          />

          <Line
            points={[
              handles[index + 1].points[0],
              handles[index + 1].points[1],
              handles[index].points[0],
              handles[index].points[1],
            ]}
            strokeWidth={1}
            stroke={"#b91c1c"}
            dash={[4, 4]}
          />
        </Group>
      )}

      {handle.type === "cubicBezier1" && (
        <Line
          points={[
            handles[index - 1].points[0],
            handles[index - 1].points[1],
            handles[index].points[0],
            handles[index].points[1],
          ]}
          strokeWidth={1}
          stroke={"#b91c1c"}
          dash={[4, 4]}
        />
      )}

      {handle.type === "cubicBezier2" && (
        <Line
          points={[
            handles[index + 1].points[0],
            handles[index + 1].points[1],
            handles[index].points[0],
            handles[index].points[1],
          ]}
          strokeWidth={1}
          stroke={"#b91c1c"}
          dash={[4, 4]}
        />
      )}

      {handle.type !== "point" && <Circle radius={4} {...props} />}
      {handle.type === "point" && (
        <Rect
          {...props}
          x={props.x}
          y={props.y}
          width={8}
          height={8}
          fill="#bef264"
          rotation={40}
          offsetX={4}
          offsetY={4}
        />
      )}
    </>
  );
}
