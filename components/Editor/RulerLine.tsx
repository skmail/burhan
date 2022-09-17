import { Ruler } from "../../types";
import {
  Group,
  KonvaNodeComponent,
  KonvaNodeEvents,
  Line,
  Rect,
  Text,
} from "react-konva";
import { RectConfig } from "konva/lib/shapes/Rect";

interface LineBoundriesProps extends KonvaNodeEvents {
  ruler: Ruler;
  width: number;
  height: number;
  x: number;
  y: number;
}

const LineBoundries = ({
  ruler,
  width,
  height,
  x,
  y,
  ...rest
}: LineBoundriesProps) => {
  return (
    <Rect
      {...rest}
      x={x}
      y={y}
      width={ruler.direction === "vertical" ? width : 10}
      height={ruler.direction === "vertical" ? 10 : height}
      opacity={0}
      fill="black"
    />
  );
};

interface Props extends KonvaNodeEvents {
  ruler: Ruler;
  width: number;
  height: number;
  color?: string;
}

export function RulerLine({
  ruler,
  width,
  height,
  color = "#ED6868",
  ...rest
}: Props) {
  return (
    <Group key={ruler.id}>
      <LineBoundries
        {...rest}
        ruler={ruler}
        width={ruler.direction === "vertical" ? width : 10}
        height={ruler.direction === "vertical" ? 10 : height}
        x={ruler.direction === "vertical" ? 0 : ruler.position - 5}
        y={ruler.direction === "horizontal" ? 0 : ruler.position - 5}
      />
      <Text
        x={ruler.direction === "vertical" ? 5 : ruler.position + 5}
        y={ruler.direction === "horizontal" ? 5 : ruler.position - 5}
        fontSize={10}
        fill={color}
        text={`${Math.round(ruler.position)}`}
        rotation={ruler.direction === "horizontal" ? 0 : -90}
      />
      <Line
        points={
          ruler.direction === "horizontal"
            ? [ruler.position, 0, ruler.position, height]
            : [0, ruler.position, width, ruler.position]
        }
        strokeWidth={1}
        stroke={color}
      />
    </Group>
  );
}
