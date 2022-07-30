import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import vector from "../utils/vector";

type KeysTable = Record<string, boolean>;
type MouseState = {
  active: boolean;
  x: number;
  y: number;
};
type MouseStates = {
  down: MouseState;
  up: MouseState;
  move: MouseState;
};

const defaultMouseState = {
  down: {
    active: false,
    x: 0,
    y: 0,
  },
  move: {
    active: false,
    x: 0,
    y: 0,
  },
  up: {
    active: false,
    x: 0,
    y: 0,
  },
};
const KeyboardContext = createContext<{
  keys: KeysTable;
  mouse: MouseStates;
}>({
  keys: {},
  mouse: defaultMouseState,
});

export default function KeyboardEventsProvider({
  children,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["div"]>) {
  const ref = useRef<HTMLDivElement>(null);

  const [keys, setKeys] = useState<KeysTable>({});
  const [needFocusOnMouseEnter, setNeedFocusOnMouseEnter] = useState(true);

  const [mouse, setMouse] = useState<MouseStates>(defaultMouseState);

  useEffect(() => {
    if (!ref.current || !needFocusOnMouseEnter) {
      return;
    }
    const element = ref.current;

    const getMousePosition = (
      x: number,
      y: number,
      element: HTMLDivElement
    ) => {
      const box = element.getBoundingClientRect();
      return vector(x - box.x, y - box.y);
    };
    const onDown = (e: MouseEvent) => {
      setMouse((mouse) => ({
        ...mouse,
        down: {
          active: true,
          ...getMousePosition(e.clientX, e.clientY, element),
        },
      }));
    };
    const onMove = (e: MouseEvent) => {
      setMouse((mouse) => ({
        ...mouse,
        move: {
          active: true,
          ...getMousePosition(e.clientX, e.clientY, element),
        },
      }));
    };
    const onLeave = (e: MouseEvent) => {
      setMouse((mouse) => ({
        ...mouse,
        down: {
          ...mouse.down,
          active: false,
        },
        up: {
          ...mouse.up,
          active: false,
        },
        move: {
          ...mouse.up,
          active: false,
        },
      }));
    };

    const onUp = (e: MouseEvent) => {
      setMouse((mouse) => ({
        ...mouse,
        up: {
          ...mouse.up,
          ...getMousePosition(e.clientX, e.clientY, element),
          active: true,
        },
      }));
    };

    element.addEventListener("mousedown", onDown);
    element.addEventListener("mousemove", onMove);
    element.addEventListener("mouseleave", onLeave);
    element.addEventListener("mouseup", onUp);

    return () => {
      element.removeEventListener("mousedown", onDown);
      element.removeEventListener("mousemove", onMove);
      element.removeEventListener("mouseup", onUp);
      element.addEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    const onKeyDown = (e: KeyboardEvent) => {
      setKeys((keys) => ({
        ...keys,
        [e.code]: true,
      }));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      setKeys((keys) => ({
        ...keys,
        [e.code]: false,
      }));
    };

    const onBlur = () => {
      setKeys({});
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
    <KeyboardContext.Provider
      value={{
        keys: keys,
        mouse,
      }}
    >
      <div {...props} tabIndex={4} ref={ref}>
        {children}
      </div>
    </KeyboardContext.Provider>
  );
}

export const useKeyboard = () => useContext(KeyboardContext);
