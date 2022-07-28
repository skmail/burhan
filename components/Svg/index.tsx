import { memo, useMemo } from "react";
import { Font } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  glyph: Font["glyphs"]["items"][0];
  metrics?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  unitsPerEm: number;
  bHeight: number;
}

function Svg({
  glyph,
  unitsPerEm,
  fill = false,
  width = 50,
  height = 50,
  bHeight,
}: Props) {
  const scale = (1 / unitsPerEm) * Math.min(width, height);
  const baseline = height / 2 + (bHeight / 2) * scale;
  const x = width / 2 - (glyph.bbox.width / 2) * scale;
  const data = useMemo(() => {
    return commandsToPathData(
      computePathCommands(
        glyph.path.commands.ids.map((id) => glyph.path.commands.items[id]),
        x,
        baseline,
        scale
      )
    );
  }, []);

  const viewBox = `0 0  ${width} ${height}`;

  return (
    <svg width={width} height={height} viewBox={viewBox}>
      <path
        fill={fill ? "black" : "none"}
        stroke="black"
        strokeWidth={fill ? 0 : 2}
        d={data}
      />
    </svg>
  );
}

export default memo(Svg);
