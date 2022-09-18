import { applyToPoint, Matrix } from "@free-transform/core";
import { useCallback } from "react";
import { useFontStore } from "../../../store/font/reducer";
import { Box, Command, Table } from "../../../types";

const toFixed = (p: number) => Number(p.toFixed(4));

export function usePointsUpdate() {
  const updateCommands = useFontStore((state) => state.updateCommands);

  return useCallback(
    (commandsTable: Table<Command>, bounds: Box, matrix: Matrix) => {
      const result = commandsTable.ids.reduce(
        (commands: Record<string, Command>, id: string) => {
          const command = commandsTable.items[id];

          if (!command.args.length) {
            return commands;
          }

          const point = applyToPoint(matrix, [
            toFixed(command.args[0] - bounds.minX),
            toFixed(command.args[1] - bounds.minY),
          ]);

          commands[id] = {
            ...command,
            args: [
              toFixed(point[0] + bounds.minX),
              toFixed(point[1] + bounds.minY),
            ],
          };

          return commands;
        },
        {}
      );

      // console.log(result, commandsTable.items);
      updateCommands(result);
    },
    []
  );
}
