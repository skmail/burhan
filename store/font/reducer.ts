import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { Command, Font, Table } from "../../types";
interface State {
  font?: Font;
  selectedGlyph?: string;
}
const initialState: State = {
  font: undefined,
  selectedGlyph: undefined,
};

const slice = createSlice({
  name: "font",
  initialState,
  reducers: {
    setFont(state, action: PayloadAction<Font>) {
      state.font = action.payload;
    },

    setSelectedGlyph(state, action: PayloadAction<string>) {
      state.selectedGlyph = action.payload;
    },
    updateCommands(state, action: PayloadAction<Record<string, Command>>) {
      if (!state.font || !state.selectedGlyph) {
        return state;
      }
      state.font.glyphs.items[state.selectedGlyph].path.commands.items = {
        ...state.font.glyphs.items[state.selectedGlyph].path.commands.items,
        ...action.payload,
      };
    },
    replaceCommands(state, action: PayloadAction<Table<Command>>) {
      const selected = String(state.selectedGlyph);
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
                    ids: [],
                    items: {
                      ...state.font.glyphs.items[selected].path.commands.items,
                      ...action.payload.items,
                    },
                  },
                },
              },
            },
          },
        },
      };
    },
  },
});

export const { setFont, setSelectedGlyph, updateCommands, replaceCommands } =
  slice.actions;

export const selectSelectedGlyphId = (state: RootState): string => {
  return String(state.font.selectedGlyph);
};

export const selectCommand = (state: RootState, id: string): Command => {
  // @ts-ignore
  return state.font.font?.glyphs.items[selectSelectedGlyphId(state)].path
    .commands.items[id];
};

export const selectCommandsTable = (state: RootState): Table<Command> => {
  // @ts-ignore
  return state.font.font?.glyphs.items[selectSelectedGlyphId(state)].path
    .commands;
};

export default slice.reducer;
