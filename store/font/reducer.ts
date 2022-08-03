import { Command, Font, Table } from "../../types";
import create from "zustand";
import produce from "immer";

interface State {
  font?: Font;
  selectedGlyphId: string;
  setFont: (font: Font) => void;
  setSelectedGlyph: (id: string) => void;
  updateCommands: (commands: Record<string, Command>) => void;
  replaceCommands: (table: Table<Command>) => void;
}

export const useFontStore = create<State>((set) => ({
  font: undefined,
  selectedGlyphId: "",

  setFont: (font) =>
    set(
      produce<State>((state) => {
        state.font = font;
      })
    ),
  setSelectedGlyph: (id: string) =>
    set(
      produce<State>((state) => {
        return {
          ...state,
          selectedGlyphId: id,
        };
      })
    ),

  updateCommands: (commands: Record<string, Command>) =>
    set(
      produce<State>((state) => {
        if (!state.font || !state.selectedGlyphId) {
          return state;
        }
        state.font.glyphs.items[state.selectedGlyphId].path.commands.items = {
          ...state.font.glyphs.items[state.selectedGlyphId].path.commands.items,
          ...commands,
        };
      })
    ),
  replaceCommands: (table: Table<Command>) =>
    set(
      produce<State>((state) => {
        const selected = String(state.selectedGlyphId);
        if (!state.font || !selected) {
          return;
        }

        return {
          ...state,
          font: {
            ...state.font,
            glyphs: {
              ...state.font.glyphs,
              items: {
                ...state.font.glyphs.items,
                [selected]: {
                  ...state.font.glyphs.items[selected],
                  path: {
                    ...state.font.glyphs.items[selected].path,
                    commands: {
                      ids: table.ids,
                      items: {
                        ...state.font.glyphs.items[selected].path.commands
                          .items,
                        ...table.items,
                      },
                    },
                  },
                },
              },
            },
          },
        };
      })
    ),
}));

export const selectCommand =
  (id: string) =>
  (state: State): Command => {
    // @ts-ignore
    return state.font?.glyphs.items[state.selectedGlyphId].path.commands.items[
      id
    ];
  };

export const selectCommandsTable = (state: State): Table<Command> => {
  // @ts-ignore
  return state.font.glyphs.items[state.selectedGlyphId].path.commands;
};
