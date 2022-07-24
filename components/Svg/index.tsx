import { memo } from "react";
import { Font, Command } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"][0];
  metrics?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

const SVG_COMMANDS: Record<Command["command"], string> = {
  moveTo: "M",
  lineTo: "L",
  quadraticCurveTo: "Q",
  bezierCurveTo: "C",
  closePath: "Z",
};
function Svg({ glyph, font, fill = false, width = 50, height = 50 }: Props) {
  const scale = (1 / font.unitsPerEm) * Math.min(width, height);

  const baseline = height / 2 + ((font.bbox.maxY + font.descent) / 2) * scale;
  const x = width / 2 - (glyph.bbox.width / 2) * scale;
  const data = commandsToPathData(
    computePathCommands(glyph.path.commands, x, baseline, scale)
  );
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
