import useFresh from "./useFresh";

export default function useFreshSelector<T>(
  useStore: any,
  callback: (state: any) => T
): () => T {
  // @ts-ignore
  const [getter, setter] = useFresh<T>();

  useStore((state: any) => {
    setter(callback(state));
  });

  return getter;
}
