import { RefObject, useEffect, useState } from "react";
import shallow from "zustand/shallow";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Bounds } from "../../../types";

export default function useBounnds(workspaceRef: RefObject<HTMLDivElement>) {
  const leftSidebar = useWorkspaceStore((state) => state.leftSidebar);
  const rightSidebar = useWorkspaceStore((state) => state.rightSidebar);
  const [bounds, setBounds] = useWorkspaceStore(
    (state) => [state.bounds, state.setBounds],
    shallow
  );
  
  useEffect(() => {
    if (!workspaceRef.current || !workspaceRef.current.parentElement) {
      return;
    }
    const parent = workspaceRef.current.parentElement;

    const onResize = () => {
      const b = parent.getBoundingClientRect();
      setBounds({
        width: parent.offsetWidth,
        height: parent.offsetHeight,
        x: b.x,
        y: b.y,
      });
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [leftSidebar, rightSidebar]);

  return bounds;
}
