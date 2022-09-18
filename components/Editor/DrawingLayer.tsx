import { RefObject, useRef } from "react";
import useDrawingPen from "./hooks/useDrawingPen";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  workspaceRef: RefObject<HTMLDivElement>;
}
export default function DrawingLayer(props: Props) {
  const drawing = useDrawingPen({
    ...props,
  });

  return null;
}
