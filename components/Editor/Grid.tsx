import { PointTuple } from "../../types";

interface Props {
  pan: PointTuple;
  width: number;
  height: number;
  zoom: number;
  size: number;
}
export default function Grid({ size, width, height, pan, zoom = 1 }: Props) {
  size = size * zoom;

  const translateX = pan[0];
  const translateY = pan[1];

  return (
    <svg
      className="absolute left-0 top-0"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="smallGrid"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id="grid"
          width={size * 4}
          height={size * 4}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${translateX}, ${translateY})`}
        >
          <rect width={size * 4} height={size * 4} fill="url(#smallGrid)" />
          <path
            d={`M ${size * 4} 0 L 0 0 0 ${size * 4}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
