import { memo, useEffect, useMemo, useState } from "react";
import { Command, OnHandleActivate, OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  handles: Command[];
  onActivate: OnHandleActivate;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  selectedHandles: string[];
  onSelect: (id: string) => void;
  onHover: (isHover: boolean) => void;
  baseline: number;
  x: number;
  scale: number;
  hovered: string[];
  active: string[];
}
function Handles({
  handles,
  onDrag,
  onDragEnd,
  selectedHandles,
  onSelect,
  onActivate,
  onHover,
  baseline,
  x,
  scale,
  hovered,
  active,
}: Props) {
  const output = useMemo(() => {
    return handles.reduce((acc, handle, index) => {
      const h = (
        <Handle
          scale={scale}
          baseline={baseline}
          x={x}
          index={index}
          handles={handles}
          onDrag={onDrag}
          key={handle.id}
          handle={handle}
          onDragEnd={onDragEnd}
          onActivate={onActivate}
          isSelected={selectedHandles.includes(handle.id)}
          onHover={onHover}
          onSelect={onSelect}
          isActive={active.includes(handle.id)}
          isHovered={hovered.includes(handle.id)}
        />
      );

      if (!handle.args.length) {
        return acc;
      }

      if (
        ["bezierCurveTo", "moveTo", "lineTo", "quadraticCurveTo"].includes(
          handle.command
        )
      ) {
        acc.push(h);
      } else {
        acc.unshift(h);
      }

      return acc;
    }, [] as any[]);
  }, [handles, scale, baseline, selectedHandles]);

  return <>{output}</>;
}

export default memo(Handles);
