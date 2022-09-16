import { applyToPoint, Matrix } from "@free-transform/core";
import { useCallback } from "react";
import { useFontStore } from "../../../store/font/reducer";
import { Box, Command, Table } from "../../../types";

export function usePointsUpdate() {
  const updateCommands = useFontStore((state) => state.updateCommands);

  return useCallback(
    (
      commandsTable: Table<Command>,
      bounds: Box,
      matrix: Matrix
    ) => {
      updateCommands(
        commandsTable.ids.reduce(
          (commands: Record<string, Command>, id: string, index: number) => {
            const command = commandsTable.items[id];

            if (!command.args.length) {
              return commands;
            }

            const point = applyToPoint(matrix, [
              command.args[0] - bounds.minX,
              command.args[1] - bounds.minY,
            ]);

            commands[id] = {
              ...command,
              args: [point[0] + bounds.minX, point[1] + bounds.minY],
            };

            return commands;
          },
          {}
        )
      );
    },
    []
  );
}
