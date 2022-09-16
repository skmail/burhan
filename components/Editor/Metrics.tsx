import { Group, Line, Rect, Text } from "react-konva";

interface Props {
  baseline: number;
  ascent: number;
  descent: number;
  capHeight: number;
  xHeight: number;
  width: number;
  height: number;
  scale: number;
  x: number;
  advanceWidth: number;
}
export default function Metrics({
  baseline,
  width,
  height,
  ascent,
  scale,
  descent,
  capHeight,
  xHeight,
  x,
  advanceWidth,
}: Props) {
  const metrics = [
    {
      name: "baseline",
      origin: baseline,
      y1: baseline,
      x1: 25,
      x2: width,
      y2: baseline,
      color: "#C4CBD7",
    },
    {
      name: "ascent",
      origin: ascent,
      y1: baseline - ascent * scale,
      y2: baseline - ascent * scale,
      x1: 25,
      x2: width,
      color: "#C4CBD7",
    },
    {
      name: "descent",
      origin: descent,
      y1: baseline - descent * scale,
      y2: baseline - descent * scale,
      x1: 25,
      x2: width,
      color: "#C4CBD7",
    },
    {
      name: "capHeight",
      origin: capHeight,
      y1: baseline - capHeight * scale,
      y2: baseline - capHeight * scale,
      x1: 25,
      x2: width,
      color: "#C4CBD7",
    },
    {
      name: "xHeight",
      origin: xHeight,
      y1: baseline - xHeight * scale,
      y2: baseline - xHeight * scale,
      x1: 25,
      x2: width,
      color: "#C4CBD7",
    },
    {
      name: "Left bearing",
      y1: 0,
      y2: height,
      x1: x,
      x2: x,
      color: "#A1EDFD",
      labelX: x - 75,
      labelY: 30,
      origin: height,
    },
    {
      name: "Advance width",
      origin: advanceWidth,
      y1: 0,
      y2: height,
      x1: x + advanceWidth * scale,
      x2: x + advanceWidth * scale,
      color: "#A1EDFD",
      labelX: x + advanceWidth * scale + 3,

      labelY: 30,
    },
  ];

  return (
    <>
      {metrics.map((metric) => (
        <Group key={metric.name}>
          <Text
            text={metric.name}
            y={metric.labelY ? metric.labelY : metric.y1 - 15}
            x={metric.labelX ? metric.labelX : metric.x1}
            padding={2}
            fill="#707C88"
          />
          {metric.name !== "ascent" && metric.name !== "descent" && (
            <Line
              points={[metric.x1, metric.y1, metric.x2, metric.y2]}
              strokeWidth={2}
              stroke={metric.color || "black"}
            />
          )}

          {metric.name === "ascent" && (
            <Rect
              x={metric.x1}
              y={0}
              width={metric.x2}
              height={metric.y1}
              fill="#C4CBD7"
              opacity={0.2}
            />
          )}

          {metric.name === "descent" && (
            <Rect
              x={metric.x1}
              y={metric.y1}
              width={metric.x2}
              height={height - metric.y1}
              fill="#C4CBD7"
              opacity={0.2}
            />
          )}
        </Group>
      ))}
    </>
  );
}
