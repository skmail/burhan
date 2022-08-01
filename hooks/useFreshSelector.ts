import { RootState } from "../store";
import { useAppSelector } from "./store";
import useFresh from "./useFresh";

export default function useFreshSelector<T>(
  callback: (state: RootState) => T
): () => T {
  const [getter, setter] = useFresh<T>();

  useAppSelector((state) => {
    setter(callback(state));
  });

  return getter;
}
