import shallow from "zustand/shallow";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import Guideline from "./Guideline";

interface Props {
  x: number;
  baseline: number;
  scale: number;
  height: number;
  width: number;
}
export default function Guidelines({
  x,
  baseline,
  scale,
  width,
  height,
}: Props) {
  const guidelines = useWorkspaceStore((state) => state.guidelines, shallow);
  const toCanvasPoint = (_x: number, _y: number) => {
    return [x + _x * scale, baseline - _y * scale];
  };

  return (
    <>
      {guidelines.map((guideline, index) => {
        const origin = toCanvasPoint(guideline.points[2], guideline.points[3]);
        const destination = toCanvasPoint(
          guideline.points[0],
          guideline.points[1]
        );

        if (guideline.command === "x" || guideline.command === "width") {
          origin[1] = 0;
          destination[1] = height;
        } else if (
          ["baseline", "ascent", "descent", "xHeight", "capHeight"].includes(
            guideline.command
          )
        ) {
          origin[0] = 0;
          destination[0] = width;
        }

        return (
          <Guideline
            key={index}
            points={
              [...destination, ...origin] as [number, number, number, number]
            }
          />
        );
      })}
    </>
  );
}
