import { RefObject, useEffect, useState } from "react";
import { PointTuple } from "../../../types";
import vector from "../../../utils/vector";
interface Props {
  workspaceRef: RefObject<HTMLDivElement>;
  setPan: (position: PointTuple) => void;
  pan: PointTuple;
}

export default function useZoom({ workspaceRef, setPan, pan }: Props) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (!workspaceRef.current || !workspaceRef.current.parentElement) {
      return;
    }
    const parent = workspaceRef.current.parentElement;

    let start = vector(0, 0);
    const onWheel = (e: WheelEvent) => {
      const element = workspaceRef.current;
      if (!element) {
        return;
      }
      const box = element.getBoundingClientRect();

      const x = e.clientX - box.x + pan[0] + e.deltaX;
      const y = e.clientY - box.y + pan[1] + e.deltaY;

      // setPan([pan[0] + e.deltaX, pan[0] + e.deltaY]);

      e.preventDefault();
      e.stopPropagation();
      const ZOOM_SENSITIVITY = 200;
      const zoomAmount = -(e.deltaY / ZOOM_SENSITIVITY);
      updateZoom(zoomAmount);
    };

    parent.addEventListener("wheel", onWheel);

    return () => {
      parent.removeEventListener("wheel", onWheel);
    };
  }, []);

  const updateZoom = (value: number) => {
    setZoom((zoom) => {      
      return Math.min(100, Math.max(zoom + value, 0.1));
    });
  };

  return {
    zoom,
    updateZoom,
    reset: () => setZoom(1),
  };
}
