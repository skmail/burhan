import { Bezier } from "bezier-js";
import { useCallback } from "react";
import useFresh from "../../../hooks/useFresh";
import { Command, NewPoint, OnCommandsAdd, Point, Table } from "../../../types";

function insert<T>(arr: T[], index: number, newItem: T[], to = 0) {
  return [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    ...newItem,
    // part of the array after the specified index
    ...arr.slice(index + to),
  ];
}
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
interface Props {
  commands: Table<Command>;
  onCommandsAdd: OnCommandsAdd;
}
export default function useInsertPoint({ commands, onCommandsAdd }: Props) {
  const getProps = useFresh({
    commands,
  });
  const onInsert = useCallback((newPoint: NewPoint) => {
    let primaryId = "";
    const { commands } = getProps();
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

      const ids = insert(commands.ids, index, [lineTo.id]);
      onCommandsAdd({
        ids: ids,
        items: {
          [lineTo.id]: lineTo,
        },
      });
    } else if (newPoint.command.command === "closePath") {
      const index = commands.ids.length - 1;
      const lineTo: Command = {
        command: "lineTo",
        id: String(Math.random()),
        args: [newPoint.point.x, newPoint.point.y],
      };

      const ids = insert(commands.ids, index, [lineTo.id]);

      primaryId = lineTo.id;

      onCommandsAdd({
        ids: ids,
        items: {
          [lineTo.id]: lineTo,
        },
      });

      return;
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

      let ids = insert(
        commands.ids,
        index - 2,
        newCommands.map((c) => c.id),
        3
      );
      primaryId = newCommands[2].id;

      onCommandsAdd({
        ids,
        items: newCommands.reduce(
          (acc, item) => ({
            ...acc,
            [item.id]: item,
          }),
          {}
        ),
      });
    } else {
      return;
    }
    return primaryId;
  }, []);

  return onInsert;
}
