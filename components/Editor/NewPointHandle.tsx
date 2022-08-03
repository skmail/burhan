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
}
export default function NewInputHandle({ x, baseline, scale }: Props) {
  const newPoint = useFontStore((state) => state.newPoint, shallow);
  const setNewPoint = useFontStore((state) => state.setNewPoint);
  const insertPoint = useInsertPoint();
  const states = useCommandStore((state) => ({
    activate: state.activate,
    hover: state.hover,
    select: state.select,
  }));

  const [getNewPoint] = useFresh(newPoint);
  if (!newPoint) {
    return null;
  }

  return (
    <>
      <Handle
        id="new"
        scale={scale}
        baseline={baseline}
        x={x}
        onDrag={(e) => {
          console.log("drag", e);
        }}
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

          states.activate(id);
          states.hover(id);

          setNewPoint();
        }}
      />
      {/* 
              <Text
                fontSize={11}
                text={`[${newPoint.index}] ${Math.round(
                  newPoint.point.x
                )},${Math.round(newPoint.point.y)} `}
                x={newPoint.point.x}
                y={newPoint.point.y - 14}
              ></Text> */}
    </>
  );
}
