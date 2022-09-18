import { Path as KonvaPath } from "react-konva";
import shallow from "zustand/shallow";
import { selectCommandsTable, useFontStore } from "../../store/font/reducer";
import { Settings } from "../../types";
import commandsToPathData from "../../utils/commandsToPathData";

interface Props {
  x: number;
  y: number;
  scale: number;

  viewMode: Settings["viewMode"];
}

export function Path({ x, y, scale, viewMode }: Props) {
  const data = useFontStore((state) => {
    const commands = selectCommandsTable(state);
    return commandsToPathData(commands.ids.map((id) => commands.items[id]));
  }, shallow);
  
  const hasSnapshot = useFontStore((state) => {
    return Boolean(state.snapshot);
  });
  const opacity = `${hasSnapshot ? ".8" : "1"}`;
 
  return (
    <KonvaPath
      x={x}
      y={y}
      data={data}
      scaleX={scale}
      scaleY={scale}
      strokeWidth={viewMode === "outline" ? 1.5 / (scale || 0.1) : 0}
      stroke="#4D7FEE"
      fill={
        viewMode !== "outline"
          ? `rgba(59, 131, 246,${opacity})`
          : `rgba(250, 250, 250, ${opacity})`
      }
    />
  );
}
