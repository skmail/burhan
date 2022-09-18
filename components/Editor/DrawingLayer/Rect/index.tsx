import { useRect } from "./useRect";
import { Props } from "../Props";

export function Rect(props: Props) {
  useRect({
    ...props,
  });

  return null;
}
