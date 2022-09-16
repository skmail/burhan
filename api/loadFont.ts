import { findFont } from "../db/database";

export default async function loadFont({ queryKey }: any) {
  const font = await findFont(queryKey[1]);

  if (!font) {
    throw new Error("font not found");
  }
  
  return font;
}
