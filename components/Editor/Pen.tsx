import { useCallback, useEffect } from "react";
import shallow from "zustand/shallow";
import useCommandStore from "../../store/commands/reducer";
import { useTransformStore } from "../../store/transform";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import Button from "../Button";

export default function Pen() {
  const togglePen = useWorkspaceStore((state) => state.toggleDrawing);
  const isActive = useWorkspaceStore((state) => state.drawing.enabled);

  const toggle = useCallback(() => {
    useCommandStore.getState().select([]);
    useTransformStore.getState().disable();
    togglePen();
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
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.444 2.737l6.666 1.9.012.004.011.003C12.072 5.146 13.5 6.907 13.5 9c.003.503-.063.912-.211 1.367l-.185.58.43.43 1.865 1.866-2.12 2.121-1.848-1.847-.435-.435-.585.193c-.469.157-.891.228-1.411.225-2.171 0-3.985-1.539-4.407-3.586l-.008-.037-.01-.037-1.832-6.39 4.903 4.903C7.552 8.55 7.5 8.768 7.5 9c0 .828.672 1.5 1.5 1.5.828 0 1.5-.672 1.5-1.5 0-.828-.672-1.5-1.5-1.5-.232 0-.45.052-.647.146l-4.91-4.91zm9.834 14.041l3.536-3.535-2.572-2.572c.167-.527.258-1.089.258-1.671 0-2.56-1.748-4.71-4.115-5.324L1 1l2.613 9.116C4.13 12.618 6.345 14.5 9 14.5c.602 0 1.182-.097 1.724-.276l2.554 2.554z"
          fillRule="nonzero"
          fillOpacity="1"
          fill="currentColor"
          stroke="none"
        ></path>
      </svg>
    </Button>
  );
}
