import { RefObject, useEffect, useRef, useState } from "react";
import { PointTuple } from "../../../types";
import vector from "../../../utils/vector";
interface Props {
  workspaceRef: RefObject<HTMLDivElement>;
  setPan: (position: PointTuple) => void;
  pan: PointTuple;
}

export default function useZoom({ workspaceRef, setPan, pan }: Props) {
  const [zoom, setZoom] = useState(1);
  const _pan = useRef(pan);
  _pan.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  useEffect(() => {
    if (!workspaceRef.current || !workspaceRef.current.parentElement) {
      return;
    }
    const parent = workspaceRef.current.parentElement;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const element = workspaceRef.current;
      if (!element) {
        return;
      }

      const ZOOM_SENSITIVITY = 200;
      const zoomAmount = -(e.deltaY / ZOOM_SENSITIVITY);

      const zoom = Math.min(
        100,
        Math.max(zoomRef.current + zoomRef.current * zoomAmount, 0.1)
      );

      setZoom(zoom);
      const box = element.getBoundingClientRect();

      const [clientX, clientY] = [e.clientX - box.x, e.clientY - box.y];

      const xs = (clientX - _pan.current[0]) / zoomRef.current;
      const ys = (clientY - _pan.current[1]) / zoomRef.current;

      const xoff = clientX - xs * zoom;
      const yoff = clientY - ys * zoom;

      setPan([xoff, yoff]);
    };

    parent.addEventListener("wheel", onWheel);

    return () => {
      parent.removeEventListener("wheel", onWheel);
    };
  }, []);

  const updateZoom = (value: number) => {
    setZoom((zoom) => Math.min(100, Math.max(zoom + zoom * value, 0.1)));
  };

  return {
    zoom,
    updateZoom,
    reset: () => setZoom(1),
  };
}
