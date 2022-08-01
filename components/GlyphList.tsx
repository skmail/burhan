import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useFresh from "../hooks/useFresh";
import { Font } from "../types";
import Svg from "./Svg";

interface Props {
  font: Omit<Font, "glyphs">;
  glyphs: Font["glyphs"];
  selected: string;
}
export default function GlyphList({ font, glyphs, selected }: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const router = useRouter();
  const [getGlyphs] = useFresh(glyphs);
  const ids = useMemo<string[]>(() => {
    const glyphs = getGlyphs();
    const keyword = searchKeyword.toLowerCase();
    if (!Boolean(keyword)) {
      return glyphs.ids;
    }

    return glyphs.ids.filter((id) => {
      const glyph = glyphs.items[id];
      return (
        keyword.includes(glyph.string.toLowerCase()) ||
        keyword === String(glyph.codePoint)
      );
    });
  }, [glyphs.ids, searchKeyword]);

  return (
    <div className="w-[240px] overflow-hidden border-r   flex flex-col h-screen border-gray-300 shadow-xl">
      <div>
        <input
          className="p-2 w-full text-sm focus:outline-none focus:ring relative focus:z-50 focus:ring-inset border border-gray-300"
          type="text"
          placeholder={"Search"}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
          }}
        />
      </div>
      <div
        className={`grid grid-cols-4 w-full flex-wrap pr-4 max-h-full  overflow-y-auto`}
      >
        {ids.map((id) => {
          const glyph = glyphs.items[id];
          return (
            <div
              key={id}
              onClick={() => {
                router.replace({
                  query: {
                    ...router.query,
                    glyph: glyph.id,
                  },
                });
              }}
              className={` p-0.5 h-14 flex items-center justify-center relative hover:z-50 ring-inset ${
                selected === glyph.id
                  ? "ring  bg-blue-500 text-white ring-blue-500 z-20"
                  : "bg-slate-50 hover:ring hover:ring-blue-500"
              } relative cursor-pointer border-[0.5px] border-gray-200`}
            >
              <Svg glyph={glyph} fill base={font.ascent - font.descent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
