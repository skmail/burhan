import { useEffect } from "react";
import shallow from "zustand/shallow";
import useFreshSelector from "../../hooks/useFreshSelector";
import { useFontStore } from "../../store/font/reducer";
import { Ruler } from "../../types";
import vector from "../../utils/vector";
import { RulerLine } from "./RulerLine";

interface Props {
  x: number;
  baseline: number;
  height: number;
  width: number;
  scale: number;
  scaleWithoutZoom: number;
}

export default function RulerLines({
  x,
  baseline,
  width,
  height,
  scale,
}: Props) {
  const rulers = useFontStore((state) => state.rulers, shallow);
  const isActiveRulerToDelete = useFontStore(
    (state) => state.isActiveRulerToDelete
  );
  const setActiveRuler = useFontStore((state) => state.setActiveRuler);
  const updateRulerPosition = useFontStore(
    (state) => state.updateRulerPosition
  );
  const activeRuler = useFontStore((state) => {
    return state.activeRuler;
  }, shallow);

  const getRulers = useFreshSelector<Ruler[]>(useFontStore, (state: any) => {
    return state.rulers;
  });
  useEffect(() => {
    if (isActiveRulerToDelete) {
      document.body.style.cursor = "url(/icons/delete-cursor.png), auto";
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isActiveRulerToDelete]);

  useEffect(() => {
    if (!activeRuler) {
      return;
    }
    const ruler = getRulers().find((ruler: any) => ruler.id === activeRuler);
    if (!ruler) {
      return;
    }
    const startPosition = vector(0, 0);
    const position = ruler.position;
    let exceeded = false;
    const onMove = (e: MouseEvent) => {
      if (startPosition.x === 0 && startPosition.y === 0) {
        startPosition.x = e.clientX;
        startPosition.y = e.clientY;
      }

      if (ruler.direction === "vertical") {
        const screenPosition =
          (baseline / scale -
            (position - (e.clientY - startPosition.y) / scale)) *
          scale;

        if (screenPosition <= 30) {
          exceeded = true;
          updateRulerPosition(ruler.id, height / scale);
          return;
        }

        updateRulerPosition(
          ruler.id,
          position - (e.clientY - startPosition.y) / scale
        );
      } else {
        const screenPosition =
          (x / scale + position + (e.clientX - startPosition.x) / scale) *
          scale;

        if (screenPosition <= 30) {
          exceeded = true;
          updateRulerPosition(ruler.id, width / scale);
          return;
        }

        updateRulerPosition(
          ruler.id,
          position + (e.clientX - startPosition.x) / scale
        );
      }
    };
    const onUp = () => {
      if (exceeded) {
        updateRulerPosition(ruler.id, position);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setActiveRuler("");
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setActiveRuler("");
    };
  }, [activeRuler]);

  const getIsActiveRulerToDelete = useFreshSelector(
    useFontStore,
    (state) => state.isActiveRulerToDelete
  );

  return (
    <>
      {rulers.map((ruler) => (
        <RulerLine
          onMouseDown={(e) => {
            setActiveRuler(ruler.id);
          }}
          onMouseEnter={(e) => {
            if (getIsActiveRulerToDelete()) {
              return;
            }
            if (ruler.direction === "horizontal") {
              document.body.style.cursor = "ew-resize";
            } else {
              document.body.style.cursor = "ns-resize";
            }
          }}
          onMouseLeave={(e) => {
            if (getIsActiveRulerToDelete()) {
              return;
            }
            document.body.style.cursor = "auto";
          }}
          key={ruler.id}
          ruler={{
            ...ruler,
            position:
              ruler.direction === "vertical"
                ? ruler.position * -scale + baseline
                : x - ruler.position * -scale,
          }}
          width={width}
          height={height}
        />
      ))}
    </>
  );
}
