import shallow from "zustand/shallow";
import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import { OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  baseline: number;
  x: number;
  scale: number;
  ids: string[];
}
function Handles({ baseline, x, scale, onDrag, onDragEnd }: Props) {
  const ids = useFontStore((state) => selectCommandsTable(state).ids, shallow);
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
        />
      ))}
    </>
  );
}

export default Handles;
