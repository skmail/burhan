import { memo, useMemo } from "react";
import shallow from "zustand/shallow";
import { useFontStore } from "../../store/font/reducer";
import commandsToPathData from "../../utils/commandsToPathData";

interface Props {
  id: string;
  fill?: boolean;
  base: number;
}

function Svg({ id, fill = false, base }: Props) {
  const [descent, glyph, height, width] = useFontStore(
    (state) => [
      -state.font.ascent,
      state.font.glyphs.items[id],
      Math.abs(state.font.ascent - state.font.descent),
      state.font.glyphs.items[id].bbox.width,
    ],
    shallow
  );

  const data = useMemo(() => {
    return commandsToPathData(
      glyph.path.commands.ids.map((id) => glyph.path.commands.items[id])
    );
  }, [glyph.path.commands.items]);

  return (
    <svg width={"100%"} height={"100%"} viewBox={`0 0 ${width} ${height}`}>
      <path
        transform={`translate(0, ${descent})`}
        fill={fill ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={fill ? 0 : 2}
        d={data}
      />
    </svg>
  );
}

export default memo(Svg);
