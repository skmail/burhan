import { useEffect } from "react";
import useFreshSelector from "../../hooks/useFreshSelector";
import useCommandStore from "../../store/commands/reducer";
import { selectGlyphCommandIds, useFontStore } from "../../store/font/reducer";
import { useWorkspaceStore } from "../../store/workspace/reducer";

export default function SelectAll() {
  const isPressed = useWorkspaceStore(
    (state) => state.keyboard.MetaLeft && state.keyboard.KeyA
  );

  const select = useCommandStore((state) => state.select);
  const getIds = useFreshSelector(useFontStore, selectGlyphCommandIds);

  useEffect(() => {
    if (!isPressed) {
      return;
    }

    select(getIds());
  }, [isPressed]);

  return null;
}
