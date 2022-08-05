import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Lookup = {
  name: string;
  oct: string;
};
export default function useGlyphLookup(codePoints: number[]) {
  return useQuery<Lookup[]>(
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
