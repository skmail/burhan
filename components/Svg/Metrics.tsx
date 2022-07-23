import { Font } from "../../types";

interface Props {
  font: Omit<Font, "glyphs">;
  y: number;
  x: number;
  scaleX: number;
  scaleY: number;
  advanceWidth: number;
}
export default function Metrics({
  font,
  scaleX,
  scaleY,
  x,
  y,
  advanceWidth,
}: Props) {
  const lines = [
    {
      name: "ascent",
      y: y + -font.ascent * scaleY,
      color: "green",
    },
    {
      name: "descent",
      y: y + -font.descent * scaleY,
      color: "red",
    },
    {
      name: "capHeight",
      y: y + -font.capHeight * scaleY,
      color: "#64748b",
    },
    {
      name: "xHeight",
      y: y + -font.xHeight * scaleY,
      color: "#94a3b8",
    },
    {
      name: "baseline",
      y: y,
      color: "#334155",
    },
  ];

  const strokeWidth = 2;

  const width = font.bbox.maxX - font.bbox.minX;

  return (
    <>
      {lines.map((line) => {
        const y = line.y;
        return (
          <g data-name={line.name} key={line.name}>
            <text
              x={x + advanceWidth * scaleX}
              y={y - 15 * scaleY}
              style={{
                font: `${30 * scaleY}px sans-serif`,
                textAlign: "right",
              }}
              fill={line.color}
            >
              {line.name}
            </text>
            <line
              data-y={line.y}
              data-name={line.name}
              x1={0}
              y1={y}
              x2={15000}
              y2={y}
              stroke={line.color}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      })}
      <line
        x1={x}
        y1={font.bbox.minY * scaleY}
        x2={x}
        y2={font.bbox.maxY * scaleY}
        stroke={"rgba(0,0,0,0.4)"}
        strokeWidth={strokeWidth}
      />
      <line
        x1={x + advanceWidth * scaleX}
        y1={0}
        x2={x + advanceWidth * scaleX}
        y2={(font.bbox.maxY - font.bbox.minY) * scaleY}
        stroke={"rgba(0,0,0,0.4)"}
        strokeWidth={strokeWidth}
      />
    </>
  );
}
