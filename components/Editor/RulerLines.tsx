import { useEffect } from "react";
import { Group, Line, Rect, Text } from "react-konva";
import shallow from "zustand/shallow";
import useFreshSelector from "../../hooks/useFreshSelector";
import { useFontStore } from "../../store/font/reducer";
import { Ruler } from "../../types";
import vector from "../../utils/vector";

interface Props {
  x: number;
  baseline: number;
  height: number;
  width: number;
  scale: number;
  scaleWithoutZoom: number;
}

const LineBoundries = ({
  ruler,
  width,
  height,
  x,
  y,
}: {
  ruler: Ruler;
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
}) => {
  const setActiveRuler = useFontStore((state) => state.setActiveRuler);
  const getIsActiveRulerToDelete = useFreshSelector(
    useFontStore,
    (state) => state.isActiveRulerToDelete
  );
  return (
    <Rect
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
      x={x}
      y={y}
      width={ruler.direction === "vertical" ? width : 10}
      height={ruler.direction === "vertical" ? 10 : height}
      opacity={0}
      fill="black"
    />
  );
};
const RulerLine = ({
  ruler,
  baseline,
  scale,
  x,
  width,
  height,
}: {
  ruler: Ruler;
  baseline: number;
  scale: number;
  x: number;
  width: number;
  height: number;
}) => {
  let pos = 0;

  if (ruler.direction === "vertical") {
    pos = ruler.position * -scale + baseline;
  } else {
    pos = x - ruler.position * -scale;
  }
  return (
    <Group key={ruler.id}>
      <LineBoundries
        ruler={ruler}
        scale={scale}
        width={ruler.direction === "vertical" ? width : 10}
        height={ruler.direction === "vertical" ? 10 : height}
        x={ruler.direction === "vertical" ? 0 : pos - 5}
        y={ruler.direction === "horizontal" ? 0 : pos - 5}
      />
      <Text
        x={ruler.direction === "vertical" ? 5 : pos + 5}
        y={ruler.direction === "horizontal" ? 5 : pos - 5}
        fontSize={10}
        fill="#ED6868"
        text={`${Math.round(ruler.position)}`}
        rotation={ruler.direction === "horizontal" ? 0 : -90}
      />
      <Line
        points={
          ruler.direction === "horizontal"
            ? [pos, 0, pos, height]
            : [0, pos, width, pos]
        }
        strokeWidth={1}
        stroke={"#ED6868"}
      />
    </Group>
  );
};
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
  return (
    <>
      {rulers.map((ruler) => (
        <RulerLine
          key={ruler.id}
          scale={scale}
          baseline={baseline}
          ruler={ruler}
          x={x}
          width={width}
          height={height}
        />
      ))}
    </>
  );
}
