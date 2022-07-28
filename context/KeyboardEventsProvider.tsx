import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type KeysTable = Record<string, boolean>;

const KeyboardContext = createContext<{
  keys: KeysTable;
}>({
  keys: {},
});

export default function KeyboardEventsProvider({
  children,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["div"]>) {
  const ref = useRef<HTMLDivElement>(null);

  const [pressedKeys, setPressedKeys] = useState<KeysTable>({});

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    const onKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((keys) => ({
        ...keys,
        [e.code]: true,
      }));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((keys) => ({
        ...keys,
        [e.code]: false,
      }));
    };

    const onBlur = () => {
      setPressedKeys({});
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
    <KeyboardContext.Provider
      value={{
        keys: pressedKeys,
      }}
    >
      <div {...props} tabIndex={4} ref={ref}>
        {children}
      </div>
    </KeyboardContext.Provider>
  );
}

export const useKeyboard = () => useContext(KeyboardContext);
