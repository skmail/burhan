import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Font } from "../types";

export default function useFontSelector(id: string) {
  const queryClient = useQueryClient();
  const baseId = id;
  const selector = useCallback(
    (id?: string) => queryClient.getQueryData(["font", id || baseId]) as Font,
    [baseId]
  );
  return selector;
}
