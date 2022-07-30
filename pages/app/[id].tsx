import type { NextPage } from "next";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Command, Font } from "../../types";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import Button from "../../components/Button";
import { Settings } from "../../types";
import useHistory from "../../hooks/useHistory";
import parseRawSvg from "../../utils/parseRawSvg";
import KeyboardEventsProvider from "../../context/KeyboardEventsProvider";
import useFresh from "../../hooks/useFresh";
import { useRouter } from "next/router";
import normalize from "../../utils/normalize";
import ToOpenType from "../../components/ToOpentype";
import GlyphInfo from "../../components/GlyphInfo";
import FontInfo from "../../components/FontInfo";
import computCommandsBounds from "../../utils/computCommandsBounds";
import GlyphList from "../../components/GlyphList";
import loadFont from "../../api/loadFont";
import { saveFont } from "../../db/database";
import useFontSelector from "../../utils/useFontSelector";

const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

const App: NextPage = () => {
  const router = useRouter();

  const fontId = `${router.query.id}`;

  const query = useQuery<Font>(["font", fontId], loadFont, {
    staleTime: Infinity,
    networkMode: "always",
    retry: 0,
  });

  const [settings, setSettings] = useState<Settings>({
    gridSize: 20,
    snapToGrid: true,
    snapToOtherPoints: true,
    viewMode: "outline",
    vectorMirrorType: "none",
  });

  const queryClient = useQueryClient();

  const updateFont = (font: Font) => {
    queryClient.setQueryData(["font", font.id], font);
    // saveFont(font);
  };

  const [selected, setSelected] = useState<string>(String(router.query.glyph));

  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);

  const history = useHistory((history, key) => {
    switch (history.type) {
      case "command.update":
        updateCommands({
          [history.payload[key].id]: history.payload[key],
        });
        break;
      case "commands.update":
        updateCommands(history.payload[key]);
        break;
    }
  });

  const getFont = useFontSelector(fontId);

  const getSelected = useFresh(selected);

  const { glyphs, font } = useMemo(() => {
    if (!query.data) {
      return {
        glyphs: {
          items: {},
          ids: [],
        } as Font["glyphs"],
        font: null as any,
      };
    }
    const { glyphs, ...font } = query.data;
    return { glyphs, font };
  }, [query.data]);

  useEffect(() => {
    if (query.isLoading || !query.isSuccess) {
      return;
    }
    const font = getFont();

    if (!font) {
      return;
    }

    const queryGlyph = String(router.query.glyph);
    if (router.query.glyph && font.glyphs.ids.includes(queryGlyph)) {
      setSelected(queryGlyph);
      return;
    }
    const id = font.glyphs.ids[Math.floor(font.glyphs.ids.length / 4)];

    if (id) {
      setSelected(id);
    }
  }, [query.isLoading, query.isSuccess, router.query.glyph]);

  const updateCommands = useCallback(
    (commands: Record<string, Command>) => {
      const font = getFont();
      const selected = getSelected();

      if (!font) {
        return;
      }

      console.log(selected);
      updateFont({
        ...font,
        glyphs: {
          ...font.glyphs,
          items: {
            ...font.glyphs.items,
            [selected]: {
              ...font.glyphs.items[selected],
              path: {
                ...font.glyphs.items[selected].path,
                commands: {
                  ...font.glyphs.items[selected].path.commands,
                  items: {
                    ...font.glyphs.items[selected].path.commands.items,
                    ...commands,
                  },
                },
              },
            },
          },
        },
      });
    },
    [selected, fontId]
  );

  const toggleViewMode = useCallback(() => {
    setSettings((settings) => ({
      ...settings,
      viewMode: settings.viewMode === "outline" ? "solid" : "outline",
    }));
  }, []);

  const onImport = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files.length) {
        return;
      }
      const file = e.target.files[0];

      if (!["image/svg+xml"].includes(file.type)) {
        alert("We only support SVG files.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const glyph = query.data?.glyphs.items[selected];

        if (!glyph) {
          return;
        }
        const result = parseRawSvg(
          String(reader.result),
          glyph.advanceWidth,
          font.capHeight
        );

        if (!query.data) {
          return;
        }

        updateFont({
          ...query.data,
          glyphs: {
            ...query.data.glyphs,
            items: {
              ...query.data.glyphs.items,
              [selected]: {
                ...query.data.glyphs.items[selected],
                path: {
                  ...query.data.glyphs.items[selected].path,
                  commands: normalize(result),
                },
              },
            },
          },
        });
      };
      reader.readAsText(file);
    },
    [query.data, selected, fontId]
  );

  const onCommandsAdd = useCallback(() => {
    (table: Font["glyphs"]["items"]["0"]["path"]["commands"]) => {
      const font = getFont();
      const selected = getSelected();
      if (!font) {
        return;
      }

      updateFont({
        ...font,
        glyphs: {
          ...font.glyphs,
          items: {
            ...font.glyphs.items,
            [selected]: {
              ...font.glyphs.items[selected],
              path: {
                ...font.glyphs.items[selected].path,

                commands: {
                  ...font.glyphs.items[selected].path.commands,
                  ids: table.ids,
                  items: {
                    ...font.glyphs.items[selected].path.commands.items,
                    ...table.items,
                  },
                },
              },
            },
          },
        },
      });
    };
  }, []);

  const onSelectHandles = useCallback((ids: string[]) => {
    setSelectedHandles((selected) => {
      if (ids.length === 0 && selected.length === 0) {
        return selected;
      }
      return ids;
    });
  }, []);
  if (query.isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-xl font-light flex-col space-y-4">
        <div className="animate-spin w-8 h-8 bg-gray-200" />
        <h1>Font is loading</h1>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="text-red-500 h-screen w-screen flex items-center justify-center text-xl font-light flex-col space-y-4">
        <ExclamationCircleIcon className="w-14 h-14" />
        <h1>Unable to load the font</h1>
        <Button onClick={() => router.replace("/")} variant="secondary">
          Go back
        </Button>
      </div>
    );
  }

  const glyph = glyphs.items[selected];

  return (
    <div className="h-screen flex  overflow-hidden">
      <div className={`fixed bottom-2 space-y-2 z-50 left-[240px] ml-2`}>
        <div className="flex space-x-2 items-end">
          <Button onClick={history.undo} disabled={!history.canUndo}>
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 22"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m8.687 0-8 8L0 8.719l.687.719 8 8L10.125 16 3.844 9.719h13.062c2.754 0 5 2.246 5 5v7h2v-7c0-3.844-3.156-7-7-7H3.843l6.282-6.281L8.687 0Z" />
            </svg>
          </Button>
          <Button onClick={history.redo} disabled={!history.canRedo}>
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 22"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m15.219 0 8 8 .687.719-.687.719-8 8L13.781 16l6.281-6.281H7a5.01 5.01 0 0 0-5 5v7H0v-7c0-3.844 3.156-7 7-7h13.063l-6.282-6.281L15.219 0Z" />
            </svg>
          </Button>

          <Button onClick={toggleViewMode} className="uppercase">
            {settings.viewMode}
          </Button>

          <Button className="uppercase relative overflow-hidden cursor-pointer">
            <input
              onChange={onImport}
              className="opacity-0 inset-0 absolute"
              type="file"
            />
            Import
          </Button>

          <ToOpenType selected={selected} font={query.data} />
        </div>
      </div>

      <GlyphList font={font} glyphs={glyphs} selected={selected} />

      {!!glyph && (
        <KeyboardEventsProvider className="flex-1  w-full  overflow-hidden">
          <Editor
            history={history}
            settings={settings}
            onCommandsAdd={onCommandsAdd}
            onCommandsUpdate={updateCommands}
            onSelectHandles={onSelectHandles}
            font={font}
            glyph={glyph}
            selectedHandles={selectedHandles}
          />
        </KeyboardEventsProvider>
      )}

      <div className="bg-white w-64 w-full h-full shadow-xl border-l border-gray-300 p-4 space-y-4">
        <div>
          <label className="text-sm uppercase text-gray-700">Grid size</label>
          <input
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                setSettings((settings) => ({
                  ...settings,
                  gridSize: value,
                }));
              }
            }}
            className="p-1 text-sm rounded-md border border-gray-300"
            value={settings.gridSize}
            type="number"
          />
        </div>
        <label className="text-sm uppercase text-gray-700 flex items-center cursor-pointer">
          <input
            className="mr-2"
            onChange={(e) => {
              setSettings((settings) => ({
                ...settings,
                snapToGrid: e.target.checked,
              }));
            }}
            type="checkbox"
            checked={settings.snapToGrid}
          />
          <span className="-mt-0.5">Snap to grid</span>
        </label>

        <label className="text-sm uppercase text-gray-700 flex items-center cursor-pointer">
          <input
            className="mr-2"
            onChange={(e) => {
              setSettings((settings) => ({
                ...settings,
                snapToOtherPoints: e.target.checked,
              }));
            }}
            type="checkbox"
            checked={settings.snapToOtherPoints}
          />
          <span className="-mt-0.5">Snap to other points</span>
        </label>

        <div>
          <label className="text-sm uppercase text-gray-700 flex items-center cursor-pointer">
            Vector mirror
          </label>
          <select
            className="p-1 text-sm rounded-md border border-gray-300"
            value={settings.vectorMirrorType}
            onChange={(e) => {
              setSettings((settings) => ({
                ...settings,
                vectorMirrorType: e.target
                  .value as Settings["vectorMirrorType"],
              }));
            }}
          >
            <option value="none">None</option>
            <option value="angle">Angle</option>
            <option value="angleLength">Angle and length</option>
          </select>
        </div>

        {!!glyph && (
          <GlyphInfo
            onFitWidth={() => {
              const bbox = computCommandsBounds(glyph.path.commands);
              const font = getFont();

              if (!font) {
                return;
              }

              updateFont({
                ...font,
                glyphs: {
                  ...font.glyphs,
                  items: {
                    ...font.glyphs.items,
                    [selected]: {
                      ...font.glyphs.items[selected],
                      bbox,
                      advanceWidth: bbox.width,
                    },
                  },
                },
              });
            }}
            glyph={glyph}
          />
        )}
        <FontInfo font={font} />
      </div>

      {/* <ImageTest /> */}
    </div>
  );
};

export default App;
