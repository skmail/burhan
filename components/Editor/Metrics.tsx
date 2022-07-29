import { Group, Line, Text } from "react-konva";

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
      x1: 0,
      x2: width,
      y2: baseline,
      color: "green",
    },
    {
      name: "ascent",
      origin: ascent,
      y1: baseline - ascent * scale,
      y2: baseline - ascent * scale,
      x1: 0,
      x2: width,
      color: "red",
    },
    {
      name: "descent",
      origin: descent,
      y1: baseline - descent * scale,
      y2: baseline - descent * scale,
      x1: 0,
      x2: width,
      color: "red",
    },
    {
      name: "capHeight",
      origin: capHeight,
      y1: baseline - capHeight * scale,
      y2: baseline - capHeight * scale,
      x1: 0,
      x2: width,
      color: "gray",
    },
    {
      name: "xHeight",
      origin: xHeight,
      y1: baseline - xHeight * scale,
      y2: baseline - xHeight * scale,
      x1: 0,
      x2: width,
      color: "gray",
    },
    {
      name: "leftSide",
      y1: 0,
      y2: height,
      x1: x,
      x2: x,
      color: "gray",
      labelX: x + 3,
      labelY: 1,
      origin: height,
    },
    {
      name: "rightSide",
      origin: advanceWidth,
      y1: 0,
      y2: height,
      x1: x + advanceWidth * scale,
      x2: x + advanceWidth * scale,
      color: "gray",
      labelX: x + advanceWidth * scale + 3,
      labelY: 1,
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
          />
          <Line
            points={[metric.x1, metric.y1, metric.x2, metric.y2]}
            strokeWidth={1}
            stroke={metric.color || "black"}
            dash={[4, 4]}
          />
        </Group>
      ))}
    </>
  );
}
