import { Command, OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  handles: Command[];
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  selectedHandles: string[];
  onSelect: (id: string) => void;
}
export default function Handles({
  handles,
  onDrag,
  onDragEnd,
  selectedHandles,
  onSelect,
}: Props) {
  const output = handles.reduce((acc, handle, index) => {
    const h = (
      <Handle
        index={index}
        handles={handles}
        onDrag={onDrag}
        key={handle.id}
        handle={handle}
        onDragEnd={onDragEnd}
        isSelected={selectedHandles.includes(handle.id)}
        onSelect={(deselect = false) => {
          if (deselect || !selectedHandles.includes(handle.id)) {
            onSelect(handle.id);
          }
        }}
      />
    );

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
  return <>{output}</>;
}
