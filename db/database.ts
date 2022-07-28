import { Font } from "../types";

import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from "idb";
const FONTS_TABLE = "fonts";

const connect = () => {
  return openDB("font", 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore(FONTS_TABLE);
    },
  });
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

  return value;
}
