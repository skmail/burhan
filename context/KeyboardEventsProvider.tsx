import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "../store/workspace/reducer";

export default function KeyboardEventsProvider({
  children,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["div"]>) {
  const ref = useRef<HTMLDivElement>(null);

  const keyboard = useWorkspaceStore((state) => ({
    setKeyboardKeys: state.setKeyboardKeys,
    resetKeyboardKeys: state.resetKeyboardKeys,
  }));

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    const shouldDetectKeys = (event: KeyboardEvent) => {
      const target = String(
        (event.target as HTMLElement).tagName
      ).toLowerCase();
      return ["textarea", "input", "button"].includes(target) === false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!shouldDetectKeys(e)) {
        return;
      }
      keyboard.setKeyboardKeys({
        [e.code]: true,
      }); 
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      if (!shouldDetectKeys(e)) {
        return;
      }
      // e.stopPropagation();
      // e.preventDefault();
      keyboard.setKeyboardKeys({
        [e.code]: false,
      });
    };

    const onBlur = () => {
      keyboard.resetKeyboardKeys();
    };

    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("keyup", onKeyUp);
    element.addEventListener("blur", onBlur);

    return () => {
      element.removeEventListener("keydown", onKeyDown);
      element.removeEventListener("keyup", onKeyUp);
      element.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div {...props} tabIndex={4} ref={ref}>
      {children}
    </div>
  );
}
