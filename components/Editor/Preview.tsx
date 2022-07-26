import { Path, Group, Rect } from "react-konva";
import { Command, Font, PointTuple, Settings } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";
import computePathCommands from "../../utils/computePathCommands";

interface Props {
  glyph: Font["glyphs"]["items"][0];
  commands: Command[];
  font: Omit<Font, "glyphs">;
  viewMode: Settings["viewMode"];
}
export default function Preview({ glyph, commands, font, viewMode }: Props) {
  const width = 200;
  const height = 200;
  const h = glyph.bbox.height;
  const w = glyph.bbox.width;

  const zoom = Math.min(h > w ? w / h : h / w, 0.9);
  const scale =
    (1 / (font.ascent - font.descent)) * Math.min(height, width) * zoom;
  const x = width / 2 - (glyph.advanceWidth / 2) * scale;

  const baseline =
    height / 2 + ((glyph.bbox.minY + glyph.bbox.maxY) / 2) * scale;

  return (
    <Group x={15} y={15}>
      <Rect
        fill="#fff"
        width={200}
        height={200}
        shadowBlur={40}
        shadowColor="#cbd5e1"
        cornerRadius={15}
      />
      <Path
        data={commandsToPathData(
          computePathCommands(commands, x, baseline, scale)
        )}
        fill={viewMode === "solid" ? "black" : undefined}
        strokeWidth={viewMode === "outline" ? 2 : undefined}
        stroke={viewMode === "outline" ? "black" : undefined}
      />
    </Group>
  );
}
