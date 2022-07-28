import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
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
}: PropsWithChildren) {
  const [pressedKeys, setPressedKeys] = useState<KeysTable>({});

  useEffect(() => {
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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return (
    <KeyboardContext.Provider
      value={{
        keys: pressedKeys,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export const useKeyboard = () => useContext(KeyboardContext);
