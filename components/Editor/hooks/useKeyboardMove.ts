import { useEffect } from "react";
import shallow from "zustand/shallow";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { OnHandleDrag, PointTuple, Settings } from "../../../types";

interface Props {
  settings: Settings;
  zoom: number;
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
}
export default function useKeyboardMove({
  settings,
  zoom,
  onDrag,
  onDragEnd,
}: Props) {
  const setGuidelines = useWorkspaceStore((state) => state.setGuidelines);

  const keys = useWorkspaceStore(
    (state) => ({
      ArrowUp: state.keyboard.ArrowUp,
      ArrowLeft: state.keyboard.ArrowLeft,
      ArrowRight: state.keyboard.ArrowRight,
      ArrowDown: state.keyboard.ArrowDown,
      ShiftLeft: state.keyboard.ShiftLeft,
      AltLeft: state.keyboard.AltLeft,
    }),
    shallow
  );

  const getSelections = useFreshSelector(
    useCommandStore,
    (state) => state.selected
  );
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  useEffect(() => {
    if (
      !keys.ArrowUp &&
      !keys.ArrowLeft &&
      !keys.ArrowRight &&
      !keys.ArrowDown
    ) {
      return;
    }
    const selections = getSelections();
    if (!selections.length) {
      return;
    }

    const move = () => {
      const firstHandle = getCommands().items[selections[0]];
      if (!firstHandle) {
        return;
      }
      const args: PointTuple = [0, 0];
      let a = 1;
      let allowSnap = true;
      if (keys.ShiftLeft) {
        a = settings.gridSize;
      } else if (keys.AltLeft) {
        a = settings.gridSize / 4;
      } else {
        allowSnap = false;
      }

      const amount = a * zoom;

      if (keys.ArrowUp) {
        args[1] = amount;
      }

      if (keys.ArrowLeft) {
        args[0] = -amount;
      }

      if (keys.ArrowRight) {
        args[0] = amount;
      }

      if (keys.ArrowDown) {
        args[1] = -amount;
      }

      onDrag(
        {
          ...firstHandle,
          args,
        },
        {
          allowSnap,
        }
      );

      onDragEnd();
    };

    move();

    const interval = setInterval(move, 100);

    return () => {
      clearInterval(interval);
      setGuidelines([]);
    };
  }, [
    keys.ArrowUp,
    keys.ArrowLeft,
    keys.ArrowRight,
    keys.ArrowDown,
    keys.ShiftLeft,
    keys.AltLeft,
    settings.gridSize,
    zoom,
  ]);
}
