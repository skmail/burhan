import { usePencil } from "./usePencil";
import { Props } from "../Props";

export function Pencil(props: Props) {
  usePencil({
    ...props,
  });

  return null;
}
