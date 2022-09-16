import { RefObject, useEffect } from "react";
import { Group } from "react-konva";
import shallow from "zustand/shallow";
import useCommandStore from "../../../store/commands/reducer";
import { useFontStore } from "../../../store/font/reducer";
import { useTransformStore } from "../../../store/transform";

import { Grid } from "./Grid";
import Scale from "./Scale";
import Rotate from "./Rotate";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { useTransformCursor } from "./useTransformCursor";

interface Props {
  scale: number;
  workspaceRef: RefObject<HTMLDivElement>;
  baseline: number;
  initialX: number;
  offset: [number, number];
}
function InternalTransformControl({
  scale,
  baseline,
  initialX,
  offset,
}: Props) {
  const selections = useCommandStore((state) => state.selected, shallow);
  const disable = useTransformStore((state) => state.disable);
  const bounds = useTransformStore((state) => state.bounds, shallow);

  useEffect(() => {
    useTransformStore.getState().setCommands({
      ids: selections,
      items:
        useFontStore.getState().font.glyphs.items[
          useFontStore.getState().selectedGlyphId
        ].path.commands.items,
    });

    return () => {
      disable();
    };
  }, [selections]);

  const affineMatrix = useTransformStore(
    (state) => state.affineMatrix,
    shallow
  );
  const targetMatrix = useTransformStore(
    (state) => state.targetMatrix,
    shallow
  );
  const perspectiveMatrix = useTransformStore(
    (state) => state.perspectiveMatrix,
    shallow
  );

  const mode = useWorkspaceStore((state) =>
    state.keyboard.AltLeft ? "warp" : "scale"
  );

  useTransformCursor();

  if (bounds.width === 0 && bounds.height === 0) {
    return null;
  }

  const scaleHandles = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [0.5, 0],
    [1, 0.5],
    [0, 0.5],
    [0.5, 1],
  ];

  const rotationHandles = [
    [0, 0, -3, -3],
    [0, 1, -3, 3],
    [1, 0, 3, -3],
    [1, 1, 3, 3],
    [0.5, 0, 0, -3],
    [1, 0.5, 3, 0],
    [0, 0.5, -3, 0],
    [0.5, 1, 0, 3],
  ];

  return (
    <>
      <Group x={initialX + bounds.x * scale} y={baseline + bounds.y * scale}>
        <Grid
          bounds={bounds}
          matrix={targetMatrix}
          scale={scale}
          affineMatrix={affineMatrix}
          perspectiveMatrix={perspectiveMatrix}
        />

        {rotationHandles.map((handle, index) => (
          <Rotate
            key={index}
            matrix={targetMatrix}
            affineMatrix={affineMatrix}
            perspectiveMatrix={perspectiveMatrix}
            position={[handle[0], handle[1]]}
            offset={[handle[2], handle[3]]}
            scale={scale}
            bounds={bounds}
            mode="rotate"
            x={offset[0] + initialX + bounds.x * scale}
            y={offset[1] + baseline + bounds.y * scale}
          />
        ))}

        {scaleHandles.map((handle, index) => (
          <Scale
            key={index}
            matrix={targetMatrix}
            affineMatrix={affineMatrix}
            perspectiveMatrix={perspectiveMatrix}
            position={[handle[0], handle[1]]}
            offset={[0, 0]}
            scale={scale}
            bounds={bounds}
            mode={mode}
          />
        ))}
      </Group>
    </>
  );
}

export default function TransformControl(props: Props) {
  const enabled = useTransformStore((state) => state.enabled);

  if (!enabled) {
    return null;
  }

  return <InternalTransformControl {...props} />;
}
