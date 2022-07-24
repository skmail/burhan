import { Group, Line } from "react-konva";

interface Props {
  points: [number, number, number, number];
}
export default function Guideline({ points }: Props) {
  console.log(
    points
  )
  return (
    <Group>
      <Line points={points} strokeWidth={1} stroke={"#d946ef"} dash={[4, 4]} />
    </Group>
  );
}
