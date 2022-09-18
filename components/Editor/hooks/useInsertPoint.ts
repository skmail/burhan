import { Bezier } from "bezier-js";
import { useCallback } from "react";
import useFreshSelector from "../../../hooks/useFreshSelector";
import { useHistoryStore } from "../../../store/history";
import { selectCommandsTable, useFontStore } from "../../../store/font/reducer";
import { Command, NewPoint, Point } from "../../../types";
import { insertToArray } from "../../../utils/insertToArray";

const toBzCommands = (p1: Point, p2: Point, p3: Point) => {
  return [
    {
      id: String(Math.random()),
      command: "bezierCurveToCP1",
      //@ts-ignore
      args: [p1.x, p1.y],
    },
    {
      id: String(Math.random()),
      command: "bezierCurveToCP2",
      //@ts-ignore

      args: [p2.x, p2.y],
    },
    {
      id: String(Math.random()),
      command: "bezierCurveTo",
      //@ts-ignore
      args: [p3.x, p3.y],
    },
  ];
};

export default function useInsertPoint() {
  const replaceCommands = useFontStore((state) => state.replaceCommands);
  const getCommands = useFreshSelector(useFontStore, selectCommandsTable);
  const addToHistory = useHistoryStore((state) => state.add);

  const onInsert = useCallback((newPoint: NewPoint) => {
    let primaryId = "";
    const commands = getCommands();
    const index = commands.ids.indexOf(newPoint.command.id);
    const p = commands.items[newPoint.command.id];

    let bz: Bezier;

    if (newPoint.command.command === "lineTo") {
      const lineTo: Command = {
        command: "lineTo",
        id: String(Math.random()),
        args: [newPoint.point.x, newPoint.point.y],
      };

      primaryId = lineTo.id;

      const ids = insertToArray(commands.ids, index, [lineTo.id]);
      replaceCommands({
        ids: ids,
        items: {
          [lineTo.id]: lineTo,
        },
      });

      addToHistory({
        type: "commands.add",
        payload: {
          new: {
            ids: ids,
            items: {
              [lineTo.id]: lineTo,
            },
          },
          old: commands,
        },
      });
    } else if (newPoint.command.command === "closePath") {
      let index = commands.ids.indexOf(newPoint.command.id) + 1;

      const lineTo: Command = {
        command: "lineTo",
        id: String(Math.random()),
        args: [newPoint.point.x, newPoint.point.y],
      };

      const ids = insertToArray(commands.ids, index - 1, [lineTo.id]);

      primaryId = lineTo.id;

      addToHistory({
        type: "commands.add",
        payload: {
          new: {
            ids: ids,
            items: {
              [lineTo.id]: lineTo,
            },
          },
          old: commands,
        },
      });
      replaceCommands({
        ids: ids,
        items: {
          [lineTo.id]: lineTo,
        },
      });
    } else if (newPoint.command.command === "bezierCurveTo") {
      const cp3 = commands.items[commands.ids[index - 3]];
      const cp1 = commands.items[commands.ids[index - 2]];
      const cp2 = commands.items[commands.ids[index - 1]];

      if (!cp1 || !cp2) {
        return;
      }

      bz = new Bezier(
        cp3.args[0],
        cp3.args[1],

        cp1.args[0],
        cp1.args[1],

        cp2.args[0],
        cp2.args[1],

        p.args[0],
        p.args[1]
      );

      const result = bz.split(newPoint.point.t || 1);

      const newCommands = [
        ...toBzCommands(
          result.left.points[1],
          result.left.points[2],
          result.left.points[3]
        ),
        ...toBzCommands(
          result.right.points[1],
          result.right.points[2],
          result.right.points[3]
        ),
      ];

      let ids = insertToArray(
        commands.ids,
        index - 2,
        newCommands.map((c) => c.id),
        3
      );
      primaryId = newCommands[2].id;

      const toInsert = {
        ids,
        items: newCommands.reduce(
          (acc, item) => ({
            ...acc,
            [item.id]: item,
          }),
          {}
        ),
      };

      addToHistory({
        type: "commands.add",
        payload: {
          new: toInsert,
          old: commands,
        },
      });

      replaceCommands(toInsert);
    } else {
      return;
    }
    return primaryId;
  }, []);

  return onInsert;
}
