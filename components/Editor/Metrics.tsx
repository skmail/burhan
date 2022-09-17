import { translate } from "@free-transform/core";
import { Group, Line, Rect, Text } from "react-konva";
import { useFontStore } from "../../store/font/reducer";
import { Ruler } from "../../types";
import { RulerLine } from "./RulerLine";

interface Props {
  baseline: number;
  ascent: number;
  descent: number;
  capHeight: number;
  xHeight: number;
  width: number;
  height: number;
  scale: number;
  leftBearing: number;
  x: number;
  advanceWidth: number;
}

interface MetricLine extends Ruler {
  name: string;
  color: string;
  resizable?: boolean;
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
  leftBearing,
}: Props) {
  const metrics: MetricLine[] = [
    {
      id: "baseline",
      position: baseline,
      direction: "vertical",
      color: "#C4CBD7",
      name: "baseline",
    },

    {
      id: "ascent",
      name: "ascent",
      position: baseline + ascent * scale,
      direction: "vertical",
      color: "#C4CBD7",
    },
    {
      id: "descent",
      name: "descent",
      position: baseline + descent * scale,
      direction: "vertical",

      color: "#C4CBD7",
    },
    {
      id: "capHeight",
      name: "capHeight",
      position: baseline + capHeight * scale,
      direction: "vertical",
      color: "#C4CBD7",
    },
    {
      name: "xHeight",
      id: "xHeight",
      position: baseline + xHeight * scale,
      direction: "vertical",
      color: "#C4CBD7",
    },
    {
      id: "leftBearing",
      name: "Left bearing",
      position: x + leftBearing * scale,
      color: "#A1EDFD",
      direction: "horizontal",
    },
    {
      id: "advanceWidth",
      name: "Advance width",
      position: x + advanceWidth * scale,
      color: "#A1EDFD",
      direction: "horizontal",
      resizable: true,
    },
  ];

  return (
    <>
      {metrics.map((metric) => (
        <Group key={metric.id}>
          <RulerLine
            key={metric.id}
            ruler={metric}
            width={width}
            height={height}
            color={metric.color}
            onMouseDown={(event) => {
              if (!metric.resizable) {
                return;
              }
              event.evt.preventDefault();
              event.evt.stopPropagation();

              const drag = translate(
                {
                  x: 0,
                  y: 0,
                  start: [event.evt.pageX, event.evt.pageY],
                },
                ({ x, y }) => {
                  if (metric.id === "advanceWidth") {
                    useFontStore.getState().updateSelectedGlyphMetrics({
                      advanceWidth: Math.round(advanceWidth + x / scale),
                    });
                  }
                }
              );

              const up = () => {
                document.removeEventListener("pointermove", drag);
                document.removeEventListener("pointerup", up);
              };
              document.addEventListener("pointermove", drag);
              document.addEventListener("pointerup", up);
            }}
            onMouseEnter={(e) => {
              if (!metric.resizable) {
                return;
              }
              if (metric.direction === "horizontal") {
                document.body.style.cursor = "ew-resize";
              } else {
                document.body.style.cursor = "ns-resize";
              }
            }}
            onMouseLeave={(e) => {
              if (!metric.resizable) {
                return;
              }
              document.body.style.cursor = "auto";
            }}
          />
          <Text
            text={metric.name}
            y={metric.direction === "vertical" ? metric.position + 5 : 30}
            x={metric.direction === "vertical" ? 30 : metric.position + 5}
            fill="#707C88"
          />
        </Group>
      ))}
    </>
  );
}
