import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GlyphLookup } from "../types";

export default function useGlyphLookup(codePoints: number[]) {
  return useQuery<GlyphLookup[]>(
    ["glyph-lookup", ...codePoints],
    async () => {
      const responses = await Promise.all(
        codePoints.map((codePoint) =>
          axios.get("/lookup", {
            params: {
              codePoint,
            },
          })
        )
      );
      return responses.map((response) => response.data);
    },
    {
      staleTime: Infinity,
    }
  );
}
