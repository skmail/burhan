import { shallowCopy } from "immer/dist/internal";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import shallow from "zustand/shallow";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import useCommandStore from "../../../store/commands/reducer";

import {
  replaceCommands,
  selectCommandsTable,
} from "../../../store/font/reducer";
import { selectKeyboard } from "../../../store/workspace/reducer";
import { Command } from "../../../types";

export default function useDeletePoints() {
  const { Backspace, Delete } = useAppSelector((state) => {
    const { Backspace, Delete } = selectKeyboard(state);
    return {
      Backspace,
      Delete,
    };
  }, shallowEqual);

  const selections = useCommandStore((state) => state.selected, shallow);
  const select = useCommandStore((state) => state.select, shallow);

  const [getSelections] = useFresh(selections);

  const getCommands = useFreshSelector(selectCommandsTable);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!Backspace && !Delete) {
      return;
    }
    const selections = getSelections();
    const commands = getCommands();
    if (!selections.length) {
      return;
    }

    const queue = [...selections];

    const result: string[] = [];

    const items: Record<string, Command> = {};

    let ids = [...commands.ids];
    let _items: Record<string, Command> = { ...commands.items };

    while (queue.length > 0) {
      const id = queue.shift() as string;

      if (result.includes(id)) {
        continue;
      }

      const command = _items[id];
      const index = ids.indexOf(id);

      switch (command.command) {
        case "lineTo":
          result.push(id);
          break;
        case "bezierCurveTo":
          result.push(id, ids[index - 1], ids[index - 2]);
          break;
        case "bezierCurveToCP1":
          result.push(id, ids[index + 1], ids[index + 2]);
          break;
        case "bezierCurveToCP2":
          result.push(id, ids[index - 1], ids[index + 1]);
          break;
        case "moveTo":
          result.push(id);
          const nextIndex = index + 1;
          const next = _items[ids[nextIndex]];
          if (next) {
            if ("bezierCurveToCP1" === next.command) {
              result.push(ids[nextIndex + 1], ids[nextIndex + 2]);
            }
            if (next.command !== "closePath") {
              items[next.id] = {
                ...next,
                command: "moveTo",
              };
            }
          }
      }

      _items = {
        ...commands.items,
        ...items,
      };

      ids = ids.filter((id) => !result.includes(id));

      // heal the path

      for (let index = 0; index < ids.length; index++) {
        const prev = _items[ids[index - 1]];

        if (
          _items[ids[index]].command === "closePath" &&
          (!prev || prev.command === "closePath")
        ) {
          result.push(ids[index]);
        }
      }

      ids = ids.filter((id) => !result.includes(id));
    }

    select([]);

    dispatch(
      replaceCommands({
        ids,
        items,
      })
    );
  }, [Backspace, Delete]);
}
