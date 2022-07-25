import { RefObject, useEffect, useRef, useState } from "react";
import { Bounds, Command } from "../../types";

interface Props {
  workspaceRef: RefObject<HTMLDivElement>;
  handles: Command[];
  onSelectHandles: (ids: string[]) => void;
}
export default function SelectionArea({
  workspaceRef,
  handles,
  onSelectHandles,
}: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handlesRef = useRef<Command[]>([]);
  handlesRef.current = handles;
 
  useEffect(() => {
    if (!workspaceRef.current) {
      return;
    }
    let startX = 0;
    let startY = 0;
    let box: DOMRect;
    const onMousedown = (e: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }
      onSelectHandles([]);
      box = workspaceRef.current.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e: MouseEvent) => {
      let width = e.clientX - startX;
      let height = e.clientY - startY;

      let x = 0;
      let y = 0;
      if (width < 0) {
        x = e.clientX - box.x;
      } else {
        x = startX - box.x;
      }

      if (height < 0) {
        y = e.clientY - box.y;
      } else {
        y = startY - box.y;
      }

      width = Math.max(Math.abs(width), 0);
      height = Math.max(Math.abs(height), 0);

      const found = handlesRef.current.filter((handle) => {
        if (
          handle.args[0] > x &&
          handle.args[0] < x + width &&
          handle.args[1] > y &&
          handle.args[1] < y + height
        ) {
          return true;
        }
        return false;
      });

      setBounds({
        width,
        height,
        x: x,
        y: y,
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
  }, []);

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
