import { useState } from "react";
import { Group, Rect, Text } from "react-konva";
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
  console.log(size)
  const barSize = 25;
  let unit = size / zoom / (size / 100);
  if (unit < 5) {
    unit = 1;
  } else if (unit < 10) {
    unit = 2;
  } else if (unit < 25) {
    unit = 10;
  } else if (unit < 50) {
    unit = 25;
  } else if (unit < 250) {
    unit = 100;
  } else if (unit < 500) {
    unit = 250;
  } else if (unit < 1000) {
    unit = 500;
  } else if (unit < 1000) {
    unit = 1000;
  } else if (unit < 50000) {
    unit = 2500;
  } else if (unit < 100000) {
    unit = 20000;
  }
  // zoom = zo;
  const zoomUnit = unit * zoom;

  // console.log(Math.round(50 * width / 100000 ) * 100000    )

  const minRange = Math.floor((-scrollPosition * zoom) / zoomUnit);
  const maxRange = Math.ceil((-scrollPosition * zoom + size) / zoomUnit);

  const length = maxRange - minRange;

  const range = [-Infinity, Infinity];

  const points = [];

  const segment = Math.ceil(zoomUnit / size);

  // console.log(segment);
  // Math.abs(Math.ceil(width / (100 * (zoom - Math.ceil(zoom) ))))
  if (!segment || segment === Infinity) {
    return null;
  }
  // console.log(segment)
  for (let i = 0; i <= length; ++i) {
    const vv = i + minRange;
    const startValue = vv * unit;

    // console.log(unit);
    const startPos = (startValue + scrollPosition) * zoom;

    for (let j = 0; j < segment; ++j) {
      const pos = startPos + (j / segment) * zoomUnit;
      const value = startValue + (j / segment) * unit;

      if (pos < 0 || pos >= size || value < range[0] || value > range[1]) {
        continue;
      }
      // console.log(label, roundup(label));
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
    // groupProps.clipY = 1
    // groupProps.clipWidth = 1;
    // groupProps.clipHeight = size;
  } else {
    rectProps.x = barSize;
    // groupProps.clipHeight = size - barSize;
    // groupProps.clipWidth = barSize;
  }
  // console.log(points);
  return (
    <Group {...groupProps} x={0} y={0}>
      <Rect {...rectProps} fill="#000"></Rect>
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
}: {
  direction: RulerDirection;
  x: number;
  y: number;
  label: string;
}) => {
  const [labelCenter, setLabelCenter] = useState(10);
  return (
    <>
      <Rect
        x={direction === "horizontal" ? x : 20}
        y={direction === "horizontal" ? 20 : y}
        
        height={direction === "horizontal" ? 5 : 2}
        width={direction === "horizontal" ? 1 : 5}
        fill="white"
      />
      <Text
        text={`${label}`}
        fill={"white"}
        y={direction === "horizontal" ? 5 : y + labelCenter}
        x={direction === "horizontal" ? x - labelCenter : 5}
        rotation={direction === "vertical" ? -90 : 0}
        fontSize={10}
        ref={(node) => {
          // node?.measureSize().height / 2
          setLabelCenter(node?.getTextWidth() / 2);
        }}
      />
    </>
  );
};
