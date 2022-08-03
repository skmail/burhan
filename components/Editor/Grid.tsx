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
      className="absolute left-0 top-0 text-outline"
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
          <circle
            id="pattern-circle"
            cx={size / 2}
            cy={size / 2}
            r={1 * zoom}
            fill="currentColor"
          ></circle>
        </pattern>
        <pattern
          id="grid"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${translateX}, ${translateY})`}
        >
          <rect 
          transform={`translate(${-size/2}, ${size/-2})`}
          width={size * 4} height={size * 4} fill="url(#smallGrid)" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
