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

  return value;
}

export async function findFonts(): Promise<Font[]> {
  const db = await connect();

  const tx = db.transaction(FONTS_TABLE);

  const value = await tx.store.getAll();

  return value;
}

export async function deleteFont(id: string) {
  const db = await connect();

  await db.delete(FONTS_TABLE, id);
}
