import { Path, Group, Rect } from "react-konva";
import { Command, Font, PointTuple, Settings } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  glyph: Font["glyphs"]["items"][0];
  commands: Command[];
  font: Omit<Font, "glyphs">;
  viewMode: Settings["viewMode"];
  data: string;
}
export default function Preview({ glyph, data, font, viewMode }: Props) {
  const size = 200;
  const scale =
    (1 / Math.max(font.ascent - font.descent, glyph.bbox.width)) * size;

  const h = (glyph.bbox.maxY + glyph.bbox.minY) * scale;
  const w = (glyph.bbox.maxX + glyph.bbox.minX) * scale;

  const x = size / 2 - (glyph.bbox.width / 2) * scale;

  const y = size / 2 + ((glyph.bbox.minY + glyph.bbox.maxY) / 2) * scale;

  return (
    <Group x={15} y={15}>
      <Rect
        fill="#fff"
        width={size}
        height={size}
        shadowBlur={40}
        shadowColor="#cbd5e1"
        cornerRadius={15}
      />
      <Path
        x={x}
        y={y}
        scaleX={scale}
        scaleY={-scale}
        data={data}
        fill={viewMode === "solid" ? "black" : undefined}
        strokeWidth={viewMode === "outline" ? 2 / scale : undefined}
        stroke={viewMode === "outline" ? "black" : undefined}
      />
    </Group>
  );
}
