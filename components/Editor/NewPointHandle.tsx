import shallow from "zustand/shallow";
import useFresh from "../../hooks/useFresh";
import useCommandStore from "../../store/commands/reducer";
import { useFontStore } from "../../store/font/reducer";
import Handle from "./Handle";
import useInsertPoint from "./hooks/useInsertPoint";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  zoom: number;
}
export default function NewInputHandle({ x, baseline, scale, zoom }: Props) {
  const newPoint = useFontStore((state) => state.newPoint, shallow);
  const setNewPoint = useFontStore((state) => state.setNewPoint);
  const insertPoint = useInsertPoint();
  const states = useCommandStore((state) => ({
    activate: state.activate,
    hover: state.hover,
    select: state.select,
  }), shallow);

  const [getNewPoint] = useFresh(newPoint);

  if (!newPoint) {
    return null;
  }

  return (
    <>
      <Handle
        zoom={zoom}
        id="new"
        scale={scale}
        baseline={baseline}
        x={x}
        onDrag={(e) => {}}
        onDragEnd={() => {}}
        onActivate={() => {
          const newPoint = getNewPoint();

          if (!newPoint) {
            return;
          }
          const id = insertPoint(newPoint);

          if (!id) {
            return;
          }

        
          states.select(id);
          states.hover(id);
          states.activate(id);

          setNewPoint();
        }}
      />
    </>
  );
}
