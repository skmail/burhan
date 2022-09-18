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
import { deleteCommands } from "../../../utils/deleteCommands";

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

    const deleted = deleteCommands(commands, selections);

    select([]);

    addToHistory({
      type: "commands.delete",
      payload: {
        old: commands,
        new: deleted,
      },
    });
    replaceCommands(deleted);
    
  }, [Backspace, Delete]);
}
