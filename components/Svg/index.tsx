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
  const [descent, glyph] = useFontStore(
    (state) => [state.font?.ascent, state.font.glyphs.items[id]],
    shallow
  );

  const data = useMemo(() => {
    return commandsToPathData(
      glyph.path.commands.ids.map((id) => glyph.path.commands.items[id])
    );
  }, [glyph.path.commands.items]);

  return (
    <svg
      width={"100%"}
      height={"100%"}
      viewBox={`0 0 ${glyph.bbox.width || 0} ${base}`}
    >
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
