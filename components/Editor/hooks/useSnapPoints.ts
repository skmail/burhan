import { useCallback } from "react";
import useCommandStore from "../../../store/commands/reducer";
import { selectSelectedGlyph, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";

export function useSnapPoints() {
  return useCallback(() => {
    const state = useFontStore.getState();
    const font = state.font;
    const glyph = selectSelectedGlyph(state);

    const snapPoints = [
      {
        id: "baseline",
        command: "baseline",
        args: [0, 0],
      },
      {
        id: "x",
        command: "x",
        args: [glyph._metrics.leftBearing, 0],
      },
      {
        id: "width",
        command: "width",
        args: [glyph._metrics.advanceWidth, 0],
      },
      {
        id: "ascent",
        command: "ascent",
        args: [0, font.ascent],
      },
      {
        id: "descent",
        command: "descent",
        args: [0, font.descent],
      },
      {
        id: "xHeight",
        command: "xHeight",
        args: [0, font.xHeight],
      },
      {
        id: "capHeight",
        command: "capHeight",
        args: [0, font.capHeight],
      },
    ];

    for (let ruler of state.rulers) {
      snapPoints.push({
        id: ruler.id,
        command: ruler.direction + "Ruler",
        args:
          ruler.direction === "horizontal"
            ? [ruler.position, 0]
            : [0, ruler.position],
      });
    }

    const selections = useCommandStore.getState().selected;

    for (let id of glyph.path.commands.ids) {
      if (selections.includes(id)) {
        continue;
      }
      snapPoints.push(glyph.path.commands.items[id]);
    }

    return snapPoints;
  }, []);
}
