import { RefObject, useEffect, useState } from "react";
import { useWorkspaceStore } from "../../../store/workspace/reducer";
import { Bounds } from "../../../types";

export default function useBounnds(workspaceRef: RefObject<HTMLDivElement>) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const leftSidebar = useWorkspaceStore((state) => state.leftSidebar);
  const rightSidebar = useWorkspaceStore((state) => state.rightSidebar);

  useEffect(() => {
    if (!workspaceRef.current || !workspaceRef.current.parentElement) {
      return;
    }
    const parent = workspaceRef.current.parentElement;

    setBounds((bounds) => ({
      ...bounds,
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    }));

    const onResize = () => {
      setBounds((bounds) => ({
        ...bounds,
        width: parent.offsetWidth,
        height: parent.offsetHeight,
      }));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [leftSidebar, rightSidebar]);

  return bounds;
}
