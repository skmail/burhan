import { Circle, Group, Line } from "react-konva";

interface Props {
  points: [number, number, number, number];
}
export default function Guideline({ points }: Props) {
  return (
    <Group>
      <Line points={points} strokeWidth={1} stroke={"#d946ef"} />
      <Circle
        x={points[2]}
        y={points[3]}
        radius={4}
        stroke={"blue"}
        strokeWidth={1}
      />
    </Group>
  );
}
