import { Font } from "../types";

import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from "idb";
const FONTS_TABLE = "fonts";

let connection: IDBPDatabase;

const connect = async () => {
  if (connection) {
    return connection;
  }
  connection = await openDB("font", 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore(FONTS_TABLE);
    },
  });
  return connection;
};
export async function saveFont(font: Font) {
  const db = await connect();

  const tx = db.transaction(FONTS_TABLE, "readwrite");

  await tx.store.put(font, font.id);

  await tx.done;
}

export async function findFont(id: string): Promise<Font> {
  const db = await connect();

  const tx = db.transaction(FONTS_TABLE);

  const value = await tx.store.get(id);

  return value
  const index = 33;
  return {
    ...value,
    glyphs: {
      ids: [value.glyphs.ids[index]],
      items: {
        [value.glyphs.ids[index]]: value.glyphs.items[value.glyphs.ids[index]],
      },
    },
  };
}
