import { applyToPoint, getAngle } from "@free-transform/core";
import { useEffect, useRef } from "react";
import { useTransformStore } from "../../../store/transform";
import { TransformHandle } from "../../../types";
import { buildDirectedImage } from "../../../utils/buildDirectedImage";
import { getRealRotation } from "../../../utils/getRealRotation";

export function useTransformCursor() {
  const rotationTimer = useRef(0);

  const cursor = useTransformStore((state) => {
    if (
      (state.activeTransformHandle !== "rotate" &&
        state.activeTransformHandle !== "scale") ||
      !state.activeTransformPosition ||
      !state.bounds
    ) {
      return;
    }
    const point = applyToPoint(state.affineMatrix, [
      state.activeTransformPosition[0] * state.bounds.width,
      state.activeTransformPosition[1] * state.bounds.height,
    ]);

    const center = applyToPoint(state.affineMatrix, [
      0.5 * state.bounds.width,
      0.5 * state.bounds.height,
    ]);

    const rotation = -getRealRotation(getAngle(point, center));

    return {
      rotation,
      handle: state.activeTransformHandle,
    };
  });

  useEffect(() => {
    if (cursor === undefined) {
      return;
    }

    window.clearTimeout(rotationTimer.current);

    buildDirectedImage(cursor.rotation, `/icons/${cursor.handle}.png`).then(
      (image) => {
        if (cursor.handle === "rotate") {
          document.body.style.cursor = `url(${image}) 10 25, auto`;
        } else {
          document.body.style.cursor = `url(${image}) 15 15, auto`;
        }
      }
    );

    return () => {
      rotationTimer.current = window.setTimeout(() => {
        document.body.style.cursor = `auto`;
      }, 40);
    };
  }, [cursor]);
}
