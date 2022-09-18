import { useCallback } from "react";
import shallow from "zustand/shallow";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { PointTuple } from "../../../types";
import { projectCommand } from "../../../utils/projectCommand";
import toGlyphPoint from "../../../utils/toGlyphPoint";

interface Props {
  x: number;
  baseline: number;
  scale: number;
}

export default function useHighlightNewPoint({ x, baseline, scale }: Props) {
  const setNewPoint = useFontStore((state) => state.setNewPoint);
  const resetNewPoint = useCallback(() => setNewPoint(undefined), []);
  const keys = useWorkspaceStore((state) => state.keyboard, shallow);
  const [getProps] = useFresh({
    x,
    scale,
    baseline,
    keys,
  });
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const highlightNewPoint = useCallback((coords: PointTuple) => {
    const { x, baseline, scale, keys } = getProps();
    const point: PointTuple = toGlyphPoint(coords, [x, baseline], scale);

    const round = keys.ShiftLeft ? 0 : 0.5;

    const commands = getCommands();

    setNewPoint(projectCommand(commands, point, 5 / scale, round));
  }, []);

  return {
    resetNewPoint,
    highlightNewPoint,
  };
}
