import { RootState } from "../store";
import { useAppSelector } from "./store";
import useFresh from "./useFresh";

export default function useFreshSelector<T>(
  useStore: any,
  callback: (state: RootState) => T
): () => T {
  const [getter, setter] = useFresh<T>();

  useStore((state: any) => {
    setter(callback(state));
  });

  return getter;
}
