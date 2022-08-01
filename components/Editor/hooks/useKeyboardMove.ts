import { useEffect } from "react";
import shallow from "zustand/shallow";
import { useKeyboard } from "../../../context/KeyboardEventsProvider";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";
import { selectCommandsTable } from "../../../store/font/reducer";
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
  const { keys } = useKeyboard();
  const selections = useCommandStore((state) => state.selected, shallow);
  const [getSelections] = useFresh(selections);
  const getCommands = useFreshSelector(selectCommandsTable);

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

    const moveUp = () => {
      const firstHandle = getCommands().items[selections[0]];
      const args: PointTuple = [0, 0];
      let a = 1;
      let snap = true;
      if (keys.ShiftLeft) {
        a = settings.gridSize;
      } else if (keys.AltLeft) {
        a = settings.gridSize / 4;
      } else {
        snap = false;
      }

      const amount = a * zoom;

      if (keys.ArrowUp) {
        args[1] += amount;
      }

      if (keys.ArrowLeft) {
        args[0] -= amount;
      }

      if (keys.ArrowRight) {
        args[0] += amount;
      }

      if (keys.ArrowDown) {
        args[1] -= amount;
      }

      onDrag(
        {
          ...firstHandle,
          args,
        },
        {
          allowSnap: snap,
        }
      );

      onDragEnd();
    };

    moveUp();
    const interval = setInterval(() => moveUp(), 200);

    return () => {
      //   setGuidelines([]);
      clearInterval(interval);
    };
  }, [
    keys.ArrowUp,
    keys.ArrowLeft,
    keys.ArrowRight,
    keys.ArrowDown,
    zoom,
    keys.ShiftLeft,
    keys.AltLeft,
    settings.gridSize,
  ]);
}
