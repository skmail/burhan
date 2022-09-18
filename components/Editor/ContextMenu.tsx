import shallow from "zustand/shallow";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import { usePopper } from "react-popper";
import { useMemo, useState } from "react";

type Item = {
  label: string;
  onClick: () => void;
};
export function ContextMenuInternal() {
  return null
  const items = [
    {
      label: "To cubic-bezier",
    },
    {
      label: "Copy",
    },
    {
      label: "Delete",
    },
  ];
  const bounds = useWorkspaceStore((state) => state.bounds, shallow);
  const position = useWorkspaceStore(
    (state) => state.contextMenu.position,
    shallow
  );
  const [popperElement, setPopperElement] = useState<HTMLDivElement>();

  const virtualElement = useMemo(
    () => ({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: position[1],
        bottom: position[1],
        left: position[0],
        right: position[0],
      }),
    }),
    [bounds, position]
  );
  // @ts-ignore
  const { styles, attributes } = usePopper(virtualElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [-10, 15],
        },
      },
    ],
  });

  return (
    <div
      onClick={() => {
        useWorkspaceStore.getState().disableContextMenu();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      className=" absolute inset-0 z-50"
    >
      <div
        style={styles.popper}
        {...attributes.popper}
        ref={(ref) => ref && setPopperElement(ref)}
        className="absolute bg-main w-52 top-44 left-44 py-2 shadow  rounded-sm"
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        {items.map((item) => (
          <div
            onClick={(e) => {
              alert("not yet...");
            }}
            key={item.label}
            className="text-sm text-white px-4 py-1.5 hover:bg-icon "
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContextMenu() {
  const isActive = useWorkspaceStore((state) => state.contextMenu.active);

  if (!isActive) {
    return null;
  }
  return <ContextMenuInternal />;
}
