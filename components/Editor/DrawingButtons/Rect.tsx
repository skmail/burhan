import { useCallback } from "react";
import useCommandStore from "../../../store/commands/reducer";
import { useTransformStore } from "../../../store/transform";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import Button from "../../Button";

export default function Rect() {
  const togglePen = useWorkspaceStore((state) => state.toggleDrawing);
  const isActive = useWorkspaceStore(
    (state) => state.drawing.enabled && state.drawing.tool === "rect"
  );

  const toggle = useCallback(() => {
    useCommandStore.getState().select([]);
    useTransformStore.getState().disable();
    togglePen("rect");
  }, []);

  return (
    <Button
      className="mt-4"
      onClick={(e) => {
        toggle();
        (e.target as HTMLButtonElement).blur();
        window.focus();
      }}
      active={isActive}
    >
      <svg
        className="w-5 h-5 currentColor"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={2}
          y={2}
          width="96"
          height="96"
          rx="15"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
        ></rect>
      </svg>
    </Button>
  );
}
