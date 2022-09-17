import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import shallow from "zustand/shallow";
import { useFontStore } from "../../store/font/reducer";
import { GlyphLookup } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import Button from "../Button";

export default function DownloadSvgButton() {
  const client = useQueryClient();

  const download = useCallback(() => {
    const state = useFontStore.getState();

    const glyph = state.font.glyphs.items[state.selectedGlyphId];

    const height = Math.abs(state.font.ascent - state.font.descent);
    const width = glyph.bbox.width || 0;

    const descent = -state.font.ascent;

    const data = commandsToPathData(
      glyph.path.commands.ids.map((id) => glyph.path.commands.items[id])
    );

    const svg = `
    <svg width="100%" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 ${width} ${height}">
    <path
      transform="translate(0, ${descent})"
      fill="#000"
      stroke="currentColor"
      strokeWidth="2"
      d="${data}"
    />
  </svg>`;

    if (!state.font) {
      return;
    }

    const nameArray = client.getQueryData<GlyphLookup[]>([
      "glyph-lookup",
      ...glyph.codePoints,
    ]);
    let name = "";
    if (nameArray) {
      name = nameArray.map((lookup) => lookup.name).join(" ");
    }

    const fileName = [state.font.familyName, state.font.subfamilyName, name]
      .join(" ")
      .replace(/\s/g, "-");
    (".svg");
    const link = document.createElement("a");
    link.setAttribute(
      "href",
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
    );

    link.download = fileName;
    link.click();
  }, []);
  return (
    <Button roundedR={false} onClick={download} className="px-3 pr-2">
      Download .SVG
      <svg
        className="w-8 h-8 ml-2"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 14.4L14.8 10.9H12.7V6H11.3V10.9H9.2L12 14.4Z"
          fill="currentColor"
        />
        <path
          d="M17.6 15.8H6.4V10.9H5V15.8C5 16.5721 5.6279 17.2 6.4 17.2H17.6C18.3721 17.2 19 16.5721 19 15.8V10.9H17.6V15.8Z"
          fill="currentColor"
        />
      </svg>
    </Button>
  );
}
