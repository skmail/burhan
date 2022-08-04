import { Command, Font, Table, NewPoint, Ruler } from "../../types";
import create from "zustand";
import produce from "immer";

interface State {
  font: Font;
  selectedGlyphId: string;
  setFont: (font: Font) => void;
  setSelectedGlyph: (id: string) => void;
  updateCommands: (commands: Record<string, Command>) => void;
  replaceCommands: (table: Table<Command>) => void;
  downloadUrl?: string;
  setDownloadUrl: (url: string) => void;
  nextGlyph: () => void;
  previousGlyph: () => void;
  newPoint?: NewPoint;
  setNewPoint: (point?: NewPoint) => void;
  rulers: Ruler[];
  addRuler: (ruler: Ruler) => void;

  updateRulerPosition: (id: string, position: number) => void;
  activeRuler: string;
  setActiveRuler: (id: string) => void;
  isActiveRulerToDelete: boolean;
  setActiveRulerToDelete: (isReady: boolean) => void;
}

export const useFontStore = create<State>((set) => ({
  // @ts-ignore
  font: undefined,
  selectedGlyphId: "",
  downloadUrl: undefined,
  newPoint: undefined,
  activeRuler: "",
  rulers: [
    {
      id: "1",
      position: 70,
      direction: "horizontal",
    },
    {
      id: "2",
      position: 70,
      direction: "vertical",
    },
  ],
  isActiveRulerToDelete: false,
  setActiveRulerToDelete: (isReady) =>
    set(
      produce<State>((state) => {
        state.isActiveRulerToDelete = isReady;
      })
    ),
  addRuler: (ruler: State["rulers"]["0"]) =>
    set(
      produce<State>((state) => {
        state.rulers.push(ruler);
      })
    ),

  setActiveRuler: (id: string) =>
    set(
      produce<State>((state) => {
        if (state.isActiveRulerToDelete && state.activeRuler) {
          state.rulers = state.rulers.filter((ruler) => {
            return ruler.id !== state.activeRuler;
          });
          state.isActiveRulerToDelete = false;
        }
        state.activeRuler = id;
      })
    ),
  setNewPoint: (point) =>
    set(
      produce<State>((state) => {
        state.newPoint = point;
      })
    ),
  updateRulerPosition: (id: string, position) =>
    set(
      produce<State>((state) => {
        state.rulers = state.rulers.map((ruler) => {
          if (ruler.id === id) {
            return {
              ...ruler,
              position,
            };
          }
          return ruler;
        });
      })
    ),
  setDownloadUrl: (url: string) =>
    set(
      produce<State>((state) => {
        state.downloadUrl = url;
      })
    ),

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

        state.font.glyphs.items[selected].path.commands.ids = table.ids;
        state.font.glyphs.items[selected].path.commands.items = {
          ...state.font.glyphs.items[selected].path.commands.items,
          ...table.items,
        };
      })
    ),

  nextGlyph: () =>
    set(
      produce<State>((state) => {
        if (!state.font || !state.selectedGlyphId) {
          return;
        }
        let index = state.font.glyphs.ids.indexOf(state.selectedGlyphId);

        if (index === state.font.glyphs.ids.length - 1) {
          index = 0;
        } else {
          index++;
        }

        state.selectedGlyphId = state.font.glyphs.ids[index];
      })
    ),
  previousGlyph: () =>
    set(
      produce<State>((state) => {
        if (!state.font || !state.selectedGlyphId) {
          return;
        }
        let index = state.font.glyphs.ids.indexOf(state.selectedGlyphId);

        if (index === 0) {
          index = state.font.glyphs.ids.length - 1;
        } else {
          index--;
        }

        state.selectedGlyphId = state.font.glyphs.ids[index];
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
