import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/store";
import {
  resetKeyboardKeys,
  selectKeyboard,
  setKeyboardKeys,
} from "../store/workspace/reducer";

export default function KeyboardEventsProvider({
  children,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["div"]>) {
  const ref = useRef<HTMLDivElement>(null);

  const [needFocusOnMouseEnter, setNeedFocusOnMouseEnter] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    const onKeyDown = (e: KeyboardEvent) => {
      dispatch(
        setKeyboardKeys({
          [e.code]: true,
        })
      );
    };

    const onKeyUp = (e: KeyboardEvent) => {
      dispatch(
        setKeyboardKeys({
          [e.code]: false,
        })
      );
    };

    const onBlur = () => {
      dispatch(resetKeyboardKeys());
      setNeedFocusOnMouseEnter(true);
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

  useEffect(() => {
    if (!ref.current || !needFocusOnMouseEnter) {
      return;
    }

    const element = ref.current;

    const onMouse = () => {
      element.focus();
      setNeedFocusOnMouseEnter(false);
    };

    element.addEventListener("mousemove", onMouse);

    return () => {
      element.removeEventListener("mousemove", onMouse);
    };
  }, [needFocusOnMouseEnter]);

  return (
    <div {...props} tabIndex={4} ref={ref}>
      {children}
    </div>
  );
}

export const useKeyboard = () => {
  return {
    keys: useAppSelector(selectKeyboard),
  };
};
