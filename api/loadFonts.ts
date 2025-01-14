import { findFont, findFonts } from "../db/database";

export default async function loadFonts() {
  return findFonts();
}
