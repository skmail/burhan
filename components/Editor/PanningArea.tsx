import { useEffect, useRef, useState } from "react";

interface Props {
  onPan: (x: number, y: number) => void;
}
export default function PanningArea({ onPan }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const onKeyup = (e: KeyboardEvent) => {
      if (e.code === "Space" && keys[e.code]) {
        keys[e.code] = false;
        setIsPanning(false);
        window.removeEventListener("keyup", onKeyup);
      }
    };
    const onKeydown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === "Space") {
        setIsPanning(true);
      }

      window.addEventListener("keyup", onKeyup);
    };

    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keyup", onKeyup);
      window.removeEventListener("keydown", onKeydown);
    };
  }, []);
  useEffect(() => {
    if (!ref.current || !isPanning) {
      return;
    }
    const element = ref.current;
    let startX = 0;
    let startY = 0;
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const movedX = e.clientX - startX;
      const movedY = e.clientY - startY;
      startY = e.clientY;
      startX = e.clientX;
      onPan(movedX, movedY);
    };
    const onMouseUp = () => {
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", onMouseUp);
    };
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseup", onMouseUp);
    };

    element.addEventListener("mousedown", onMouseDown);

    return () => {
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", onMouseUp);
    };
  }, [isPanning]);

  if (!isPanning) {
    return null;
  }
  return (
    <div
      ref={ref}
      style={{
        cursor: "grab",
      }}
      className="absolute left-0 top-0 inset-0 z-50"
    />
  );
}
