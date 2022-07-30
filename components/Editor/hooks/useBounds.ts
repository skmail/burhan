import { RefObject, useEffect, useState } from "react";
import { Bounds } from "../../../types";

export default function useBounnds(workspaceRef: RefObject<HTMLDivElement>) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

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
  }, []);

  return bounds;
}
