import { usePen } from "./usePen";
import { Props } from "../Props";

export function Pen(props: Props) {
  usePen({
    ...props,
  });

  return null;
}
