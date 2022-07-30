import { memo, useMemo } from "react";
import { Font } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  glyph: Font["glyphs"]["items"][0];
  fill?: boolean;
  base: number;
}

function Svg({ glyph, fill = false, base }: Props) {
  const data = useMemo(() => {
    return commandsToPathData(
      glyph.path.commands.ids.map((id) => glyph.path.commands.items[id])
    );
  }, [glyph.path.commands.items]);

  return (
    <svg
      width={"100%"}
      height={"100%"}
      viewBox={`0 0 ${glyph.advanceWidth || 0} ${base}`}
      style={{
        transform: "scaleY(-1)",
      }}
    >
      <path
        transform={`translate(0, ${glyph.bbox.height / 2})`}
        fill={fill ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={fill ? 0 : 2}
        d={data}
      />
    </svg>
  );
}

export default memo(Svg);
