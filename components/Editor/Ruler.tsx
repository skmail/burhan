import { useMemo, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import useFreshSelector from "../../hooks/useFreshSelector";
import { useFontStore } from "../../store/font/reducer";
import vector from "../../utils/vector";
type RulerDirection = "horizontal" | "vertical";

interface Props {
  size: number;
  zoom: number;
  scrollPosition: number;
  direction?: RulerDirection;
}

export default function HorizontalRuler({
  size,
  zoom,
  direction = "horizontal",
  scrollPosition,
}: Props) {
  const points = useMemo(() => {
    let unit = size / zoom / (size / 100);
    if (unit < 1) {
      unit = 0.5;
    } else if (unit < 5) {
      unit = 1;
    } else if (unit < 10) {
      unit = 5;
    } else if (unit < 30) {
      unit = 10;
    } else if (unit < 50) {
      unit = 20;
    } else if (unit < 100) {
      unit = 50;
    } else if (unit < 300) {
      unit = 100;
    } else if (unit < 500) {
      unit = 250;
    } else if (unit < 1000) {
      unit = 500;
    } else if (unit < 10000) {
      unit = 2500;
    } else {
      unit = 10000;
    }

    const zoomUnit = unit * zoom;
    const minRange = Math.floor((-scrollPosition * zoom) / zoomUnit);
    const maxRange = Math.ceil((-scrollPosition * zoom + size) / zoomUnit);

    const length = maxRange - minRange;

    const range = [-Infinity, Infinity];

    const points = [];

    let segment = Math.ceil(zoomUnit / size);

    if (!segment || segment === Infinity) {
      segment = 1;
    }

    for (let i = 0; i <= length; ++i) {
      const vv = i + minRange;
      const startValue = vv * unit;

      const startPos = (startValue + scrollPosition) * zoom;

      for (let j = 0; j < segment; ++j) {
        const pos = startPos + (j / segment) * zoomUnit;
        let value: number;

        if (direction === "vertical") {
          value = (j / segment) * unit - startValue;
        } else {
          value = startValue + (j / segment) * unit;
        }

        if (pos < 0 || pos >= size || value < range[0] || value > range[1]) {
          continue;
        }

        if (direction === "vertical") {
          points.push({
            x: 0,
            y: pos,
            isSub: j > 0,
            label: String(Math.round(value)),
          });
        } else {
          points.push({
            x: pos,
            y: 0,
            isSub: j > 0,
            label: String(Math.round(value)),
          });
        }
      }
    }

    return points;
  }, [size, zoom, scrollPosition]);
  const barSize = 25;
  let groupProps = {
    clipHeight: 0,
    clipWidth: 0,
  };
  let rectProps = {
    width: size,
    height: barSize,
    x: 0,
    y: 0,
  };
  if (direction === "vertical") {
    rectProps = {
      width: barSize,
      height: size - barSize,
      x: 0,
      y: barSize,
    };
  } else {
    rectProps.x = barSize;
  }
  const addRuler = useFontStore((state) => state.addRuler);
  const setActiveRuler = useFontStore((state) => state.setActiveRuler);
  const getActiveRuler = useFreshSelector(useFontStore, (state) => {
    if (!state.activeRuler) {
      return;
    }
    return state.rulers.find((ruler: any) => ruler.id === state.activeRuler);
  });
  const setActiveRulerToDelete = useFontStore(
    (state) => state.setActiveRulerToDelete
  );
  return (
    <Group
      onMouseEnter={() => {
        const activeRuler = getActiveRuler();
        const isActiveToDelete =
          activeRuler && activeRuler.direction !== direction;

        if (activeRuler) {
          setActiveRulerToDelete(isActiveToDelete);
        }
        if (isActiveToDelete) {
          return;
        }
        if (direction === "horizontal") {
          document.body.style.cursor = "ew-resize";
        } else {
          document.body.style.cursor = "ns-resize";
        }
      }}
      onMouseLeave={() => {
        document.body.style.cursor = "auto";
        setActiveRulerToDelete(false);
      }}
      onMouseDown={(e) => {
        let position: number;
        if (direction == "horizontal") {
          // @ts-ignore
          position = -Math.round(scrollPosition - e.evt.layerX / zoom);
        } else {
          // @ts-ignore
          position = -Math.round(e.evt.layerY / zoom - scrollPosition);
        }

        const id = String(Math.random());
        addRuler({
          id,
          direction,
          position,
        });
        setActiveRuler(id);
      }}
      {...groupProps}
      x={0}
      y={0}
    >
      <Rect {...rectProps} fill="#F3F5F7"></Rect>
      <Rect
        width={direction === "horizontal" ? size : 0}
        height={direction === "horizontal" ? 0 : size}
        x={direction === "horizontal" ? 0 : barSize}
        y={direction === "horizontal" ? barSize : 0}
        fill="#F3F5F7"
        stroke={"#C4CBD7"}
        strokeWidth={2}
      />
      {points.map((value, index) => (
        <RulerNode
          label={value.label}
          x={value.x}
          y={value.y}
          direction={direction}
          key={index}
        />
      ))}
    </Group>
  );
}

const RulerNode = ({
  direction,
  x,
  y,
  label,
  opacity = 1,
}: {
  direction: RulerDirection;
  x: number;
  y: number;
  opacity?: number;
  label: string;
}) => {
  const [labelCenter, setLabelCenter] = useState(10);
  return (
    <Group opacity={opacity}>
      <Rect
        x={direction === "horizontal" ? x : 20}
        y={direction === "horizontal" ? 20 : y}
        height={direction === "horizontal" ? 5 : 1}
        width={direction === "horizontal" ? 1 : 5}
        fill="#707C88"
      />
      <Text
        text={`${label}`}
        fill={"#707C88"}
        y={direction === "horizontal" ? 5 : y + labelCenter}
        x={direction === "horizontal" ? x - labelCenter : 5}
        rotation={direction === "vertical" ? -90 : 0}
        fontSize={10}
        ref={(node) => {
          if (!node) {
            return;
          }
          setLabelCenter(node?.getTextWidth() / 2);
        }}
      />
    </Group>
  );
};
