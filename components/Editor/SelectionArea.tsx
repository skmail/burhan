import { RefObject, useEffect, useRef, useState } from "react";
import useFresh from "../../hooks/useFresh";
import { Bounds, Command } from "../../types";
import onLeftButton from "../../utils/onLeftButton";
import scaleX from "../../utils/scaleX";
import scaleY from "../../utils/scaleY";
import vector from "../../utils/vector";

interface Props {
  workspaceRef: RefObject<HTMLDivElement>;
  handles: Command[];
  onSelectHandles: (ids: string[]) => void;
  scale: number;
  baseline: number;
  x: number;
}
export default function SelectionArea({
  workspaceRef,
  handles,
  onSelectHandles,
  scale,
  baseline,
  x,
}: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const getHandles = useFresh(handles);

  useEffect(() => {
    if (!workspaceRef.current) {
      return;
    }
    let startX = 0;
    let startY = 0;
    let box: DOMRect;
    let handles = getHandles();

    const onMousedown = onLeftButton((e: MouseEvent) => {
      handles = getHandles();
      if (!workspaceRef.current) {
        return;
      }
      onSelectHandles([]);
      box = workspaceRef.current.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    const onMouseMove = (e: MouseEvent) => {
      let width = e.clientX - startX;
      let height = e.clientY - startY;

      const position = vector();

      if (width < 0) {
        position.x = e.clientX - box.x;
      } else {
        position.x = startX - box.x;
      }

      if (height < 0) {
        position.y = e.clientY - box.y;
      } else {
        position.y = startY - box.y;
      }

      width = Math.max(Math.abs(width), 0);
      height = Math.max(Math.abs(height), 0);

      const found = handles.filter((handle) => {
        const scaledX = scaleX(handle.args[0], x, scale);
        const scaledY = scaleY(handle.args[1], baseline, scale);

        if (
          scaledX > position.x &&
          scaledX < position.x + width &&
          scaledY > position.y &&
          scaledY < position.y + height
        ) {
          return true;
        }
        return false;
      });

      setBounds({
        width,
        height,
        x: position.x,
        y: position.y,
      });
      onSelectHandles(found.map((h) => h.id));
    };
    const onMouseUp = () => {
      setBounds({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    workspaceRef.current?.addEventListener("mousedown", onMousedown);
  }, [scale, x, baseline]);

  if (!bounds.width || !bounds.height) {
    return null;
  }

  return (
    <div
      className="absolute ring-1 ring-sky-500 bg-sky-500 bg-opacity-5"
      style={{
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y,
      }}
    ></div>
  );
}
