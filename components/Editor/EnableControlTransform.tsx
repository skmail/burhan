import { useEffect } from "react";
import { useTransformStore } from "../../store/transform";
import { useWorkspaceStore } from "../../store/workspace/reducer";

export default function EnableControlTransform() {
  const isPressed = useWorkspaceStore((state) => {
    return state.keyboard.MetaLeft && state.keyboard.KeyR;
  });
  const enable = useTransformStore((state) => state.enable);

  useEffect(() => {
    if (!isPressed) {
      return;
    }
    enable();
  }, [isPressed]);
  return null;
}
