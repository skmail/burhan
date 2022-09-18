import { memo } from "react";
import shallow from "zustand/shallow";
import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import { useTransformStore } from "../../store/transform";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import { OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  baseline: number;
  x: number;
  scale: number;
  zoom: number;
  ids: string[];
}
function Handles({ baseline, x, scale, zoom, onDrag, onDragEnd }: Props) {
  const ids = useFontStore((state) => selectCommandsTable(state).ids, shallow);
  const isTransformEnabled = useTransformStore((state) => state.enabled);
  const hideByDrawing = useWorkspaceStore(
    (state) => state.drawing.enabled && state.drawing.tool === "pencil"
  );

  if (isTransformEnabled || hideByDrawing) {
    return null;
  }

  return (
    <>
      {ids.map((id) => (
        <Handle
          scale={scale}
          baseline={baseline}
          x={x}
          onDrag={onDrag}
          key={id}
          id={id}
          onDragEnd={onDragEnd}
          zoom={zoom}
        />
      ))}
    </>
  );
}

export default memo(Handles);
