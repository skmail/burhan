import { PointTuple } from "../types";

export default function quadraticToQubic(
  prev: PointTuple,
  quad: [number, number, number, number]
):  [number, number, number, number, number, number] {
  return [
    Number(prev[0] + (2 / 3) * (quad[0] - prev[0])),
    Number(prev[1] + (2 / 3) * (quad[1] - prev[1])),
    Number(quad[2] + (2 / 3) * (quad[0] - quad[2])),
    Number(quad[3] + (2 / 3) * (quad[1] - quad[3])),
    quad[2],
    quad[3],
  ];
}
