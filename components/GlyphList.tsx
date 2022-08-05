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
    <div className="w-[240px] overflow-hidden flex flex-col h-screen shadow-xl p-2 border-r-2 border-outline">
      <div className="text-main font-medium mb-4">Glyphs</div>
      <div className="relative mb-4">
        <input
          className="p-3 rounded-md w-full text-sm focus:outline-none focus:ring relative focus:z-50 focus:ring focus:ring-active-2 bg-input-bg"
          type="text"
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
          }}
        />
        <svg
          className="w-8 h-8 text-icon absolute right-2 top-1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.9871 16.9741C12.3154 16.9739 13.6055 16.5292 14.6519 15.7109L17.9418 19.0007L19 17.9425L15.7101 14.6526C16.5288 13.6062 16.9738 12.3158 16.9741 10.9871C16.9741 7.68595 14.2882 5 10.9871 5C7.68595 5 5 7.68595 5 10.9871C5 14.2882 7.68595 16.9741 10.9871 16.9741ZM10.9871 6.49677C13.4635 6.49677 15.4774 8.51066 15.4774 10.9871C15.4774 13.4635 13.4635 15.4774 10.9871 15.4774C8.51066 15.4774 6.49677 13.4635 6.49677 10.9871C6.49677 8.51066 8.51066 6.49677 10.9871 6.49677Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div
        className={`grid gap-2 grid-cols-3 w-full flex-wrap max-h-full  overflow-y-auto`}
      >
        {ids.map((id) => {
          return (
            <div
              key={id}
              onClick={() => {
                router.replace({
                  query: {
                    ...router.query,
                    glyph: id,
                  },
                });
              }}
              className={`h-[70px] p-4 rounded-lg flex items-center justify-center relative hover:z-50 ring-inset ${
                selected === id
                  ? "text-active-2 bg-active-1"
                  : "text-main hover:bg-input-bg"
              } relative cursor-pointer`}
            >
              <Svg id={id} fill base={font.ascent - font.descent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
