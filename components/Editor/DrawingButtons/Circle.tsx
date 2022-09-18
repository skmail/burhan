import { useCallback } from "react";
import useCommandStore from "../../../store/commands/reducer";
import { useTransformStore } from "../../../store/transform";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import Button from "../../Button";

export default function Circle() {
  const togglePen = useWorkspaceStore((state) => state.toggleDrawing);
  const isActive = useWorkspaceStore(
    (state) => state.drawing.enabled && state.drawing.tool === "circle"
  );

  const toggle = useCallback(() => {
    useCommandStore.getState().select([]);
    useTransformStore.getState().disable();
    togglePen("circle");
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
        <circle
          x={2}
          y={2}
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
        ></circle>
      </svg>
    </Button>
  );
}
