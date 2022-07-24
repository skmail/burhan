import { Command, Handle as HandleType, OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  handles: HandleType[];
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
}
export default function Handles({ handles, onDrag, onDragEnd }: Props) {
  const output = handles.reduce((acc, handle, index) => {
    const h = (
      <Handle
        index={index}
        handles={handles}
        onDrag={onDrag}
        key={`${handle.id}-${handle.type}`}
        handle={handle}
        onDragEnd={onDragEnd}
      />
    );

    if (handle.type === "point") {
      acc.push(h);
    } else {
      acc.unshift(h);
    }

    return acc;
  }, [] as any[]);
  return <>{output}</>;
}
