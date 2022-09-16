import { Path } from "react-konva";
import shallow from "zustand/shallow";
import { useFontStore } from "../../store/font/reducer";
import commandsToPathData from "../../utils/commandsToPathData";

interface Props {
  x: number;
  y: number;
  scale: number;
}

export function SnapshotPath({ x, y, scale }: Props) {
  const snapshotData = useFontStore((state) => {
    if (state.snapshot) {
      const items = state.snapshot.items;
      return commandsToPathData(state.snapshot.ids.map((id) => items[id]));
    }
  }, shallow);

  if (!snapshotData) {
    return null;
  }
  return (
    <Path
      x={x}
      y={y}
      data={snapshotData}
      scaleX={scale}
      scaleY={scale}
      strokeWidth={1.2 / (scale || 0.1)}
      stroke="#d1d5db"
    />
  );
}
