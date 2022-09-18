import { useCallback, useEffect } from "react";
import shallow from "zustand/shallow";
import useCommandStore from "../../../store/commands/reducer";
import { useTransformStore } from "../../../store/transform";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import Button from "../../Button";

export default function Pencil() {
  const togglePencil = useWorkspaceStore((state) => state.toggleDrawing);
  const isActive = useWorkspaceStore(
    (state) => state.drawing.enabled && state.drawing.tool === "pencil"
  );

  const toggle = useCallback(() => {
    useCommandStore.getState().select([]);
    useTransformStore.getState().disable();
    togglePencil("pencil");
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
        viewBox="0 0 19 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.313 16.431l10.82-10.82c.782-.782.782-2.048 0-2.829L16.72 1.368c-.781-.781-2.048-.781-2.829 0l-10.82 10.82-1.061 5.304 5.303-1.06zM12.235 4.44L3.992 12.68l-.707 3.536 3.535-.707 8.243-8.243-2.829-2.828zm.707-.707L15.77 6.56l1.657-1.657c.39-.39.39-1.023 0-1.414l-1.414-1.414c-.39-.39-1.024-.39-1.415 0l-1.657 1.657z"
          fillRule="nonzero"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        ></path>
      </svg>
    </Button>
  );
}
