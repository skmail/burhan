import { useRef } from "react";

export default function useFresh<T>(variable: T): [() => T, (value: T) => T] {
  const ref = useRef<T>(variable);
  if (variable !== undefined) {
    ref.current = variable;
  }
  return [() => ref.current, (value: T) => (ref.current = value)];
}
