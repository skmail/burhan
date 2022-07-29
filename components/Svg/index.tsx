import { memo, useMemo } from "react";
import { Font } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  glyph: Font["glyphs"]["items"][0];
  fill?: boolean;

  unitsPerEm: number;
  base: number;
}

function Svg({
  glyph,
  unitsPerEm,
  fill = false, 
  base,
}: Props) {
  const scale =
    (1 / unitsPerEm) * Math.min(glyph.bbox.height, glyph.bbox.width);
  const scaleX = scale;
  const baseline = (base + 0) * scale;
  const x = (0 - glyph.bbox.minX) * scaleX;

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

  const zoom = 0.8;
  const xx = Math.round((glyph.bbox.maxX - glyph.bbox.minX) * scaleX);
  const yy = Math.round((base) * scale);
  const viewBox = `0 0  ${xx + xx * (zoom - 1)} ${yy + yy * ( 1 - zoom)}`;

  return (
    <svg width={"100%"} height={"100%"} viewBox={viewBox}>
      <path
        fill={fill ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={fill ? 0 : 2}
        d={data}
      />
    </svg>
  );
}

export default memo(Svg);
