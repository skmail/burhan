import { RefObject, useRef } from "react";
import useDrawingPen from "./hooks/useDrawingPen";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  scaleWithoutZoom: number;
}
export default function DrawingLayer(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drawing = useDrawingPen({
    ...props,
    workspaceRef: ref,
  });

  if (!drawing.enabled) {
    return null;
  }

  return <div ref={ref} className="absolute inset-0 z-50" />;
}
