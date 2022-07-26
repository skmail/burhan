import { useRef } from "react";

export default function useFresh<T>(variable: T): () => T {
  const ref = useRef(variable);

  ref.current = variable;

  return () => ref.current;
}
