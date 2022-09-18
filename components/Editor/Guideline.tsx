import { Circle, Group, Line } from "react-konva";

interface Props {
  points: [number, number, number, number];
}
export default function Guideline({ points }: Props) {
  return <Line points={points} strokeWidth={1} stroke={"#d946ef"} />;
}
