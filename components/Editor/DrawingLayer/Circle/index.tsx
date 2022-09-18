import { useCircle } from "./useCircle";
import { Props } from "../Props";

export function Circle(props: Props) {
  useCircle({
    ...props,
  });

  return null;
}
