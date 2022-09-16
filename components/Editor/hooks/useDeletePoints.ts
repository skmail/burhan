import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import shallow from "zustand/shallow";

import useFresh from "../../../hooks/useFresh";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { useHistoryStore } from "../../../store/history";
import useCommandStore from "../../../store/commands/reducer";

import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Command } from "../../../types";

export default function useDeletePoints() {
  const { Backspace, Delete } = useWorkspaceStore((state) => {
    return {
      Backspace: state.keyboard.Backspace,
      Delete: state.keyboard.Backspace,
    };
  }, shallowEqual);

  const selections = useCommandStore((state) => state.selected, shallow);
  const select = useCommandStore((state) => state.select, shallow);

  const [getSelections] = useFresh(selections);

  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);

  const replaceCommands = useFontStore((state) => state.replaceCommands);

  const addToHistory = useHistoryStore((state) => state.add);

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

    addToHistory({
      type: "commands.delete",
      payload: {
        old: commands,
        new: {
          ids,
          items,
        },
      },
    });
    replaceCommands({
      ids,
      items,
    });
  }, [Backspace, Delete]);
}
