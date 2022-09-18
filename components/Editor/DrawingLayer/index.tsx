import shallow from "zustand/shallow";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Pen } from "./Pen";
import { Props } from "./Props";
import { Rect } from "./Rect";

export default function DrawingLayer(props: Props) {
  const drawing = useWorkspaceStore((state) => state.drawing, shallow);

  if (!drawing.enabled) {
    return null;
  }

  if (drawing.tool === "pen") {
    return <Pen {...props} />;
  }

  if (drawing.tool === "rect") {
    return <Rect {...props} />;
  }
  return null;
}
