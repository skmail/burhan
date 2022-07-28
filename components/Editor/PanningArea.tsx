import { useEffect, useRef, useState } from "react";
import { useKeyboard } from "../../context/KeyboardEventsProvider";
import onLeftButton from "../../utils/onLeftButton";

interface Props {
  onPan: (x: number, y: number) => void;
}
export default function PanningArea({ onPan }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { keys } = useKeyboard();
  const isPanning = keys["Space"] === true;

  useEffect(() => {
    if (!ref.current || !isPanning) {
      return;
    }

    const element = ref.current;
    let startX = 0;
    let startY = 0;
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
    const onMouseDown = onLeftButton((e: MouseEvent) => {
      e.preventDefault();
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseup", onMouseUp);
    });

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
      tabIndex={1}
      ref={ref}
      style={{
        cursor: "grab",
      }}
      className="absolute left-0 top-0 inset-0 z-50"
    />
  );
}
