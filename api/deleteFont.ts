import { deleteFont as deleteFontFromDB } from "../db/database";

export default async function deleteFont({ id }: any) {
  return deleteFontFromDB(id);
}
