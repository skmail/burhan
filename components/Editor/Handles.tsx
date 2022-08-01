import { memo, useEffect, useMemo, useState } from "react";
import { shallowEqual } from "react-redux";
import { useAppSelector } from "../../hooks/store";
import { selectCommandsTable } from "../../store/font/reducer";
import { Command, OnHandleActivate, OnHandleDrag } from "../../types";
import Handle from "./Handle";

interface Props {
  onDrag: OnHandleDrag;
  onDragEnd: () => void;
  baseline: number;
  x: number;
  scale: number;
  ids: string[];
}
function Handles({ baseline, x, scale, onDrag, onDragEnd, ids }: Props) {
  return (
    <>
      {ids.map((id) => (
        <Handle
          scale={scale}
          baseline={baseline}
          x={x}
          onDrag={onDrag}
          key={id}
          id={id}
          onDragEnd={onDragEnd}
        />
      ))}
    </>
  );
}

export default Handles;
