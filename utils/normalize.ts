import { Table } from "../types";

export default function normalize<T extends { id: string }>(
  data: T[],
  itemUpdater?: (item: T) => T
) {
  return data.reduce(
    (acc: Table<T>, item) => {
      acc.ids.push(item.id);

      if (itemUpdater) {
        item = itemUpdater(item);
      }

      acc.items[item.id] = item;

      return acc;
    },
    {
      ids: [],
      items: {},
    }
  );
}
