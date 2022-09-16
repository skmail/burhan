import type { NextPage } from "next";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Command, Font, ViewMode } from "../../types";
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

import { useFontStore } from "../../store/font/reducer";

import shallow from "zustand/shallow";

import Header from "../../components/Header";
import DownloadSvgButton from "../../components/Editor/DownloadSvgButton";
import { useWorkspaceStore } from "../../store/workspace/reducer";
import useFreshSelector from "../../hooks/useFreshSelector";
import NodeTransform from "../../components/Editor/NodeTransform";
import { FlipButtons } from "../../components/Editor/FlipButtons";
const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

const App: NextPage = () => {
  const router = useRouter();

  const fontState = useFontStore(
    (state) => ({
      setSelectedGlyph: state.setSelectedGlyph,
      setFont: state.setFont,
      selectedGlyphId: state.selectedGlyphId,
    }),
    shallow
  );

  const resetFont = useFontStore((state) => state.reset);

  useEffect(
    () => () => {
      resetFont();
    },
    []
  );

  const fontId = `${router.query.id}`;

  const query = useQuery<Font>(["font", fontId], loadFont, {
    staleTime: Infinity,
    networkMode: "always",
    retry: 0,
  });

  const { isReady, setReady } = useWorkspaceStore(
    (state) => ({
      isReady: state.ready,
      setReady: state.setReady,
    }),
    shallow
  );

  useEffect(() => {
    if (query.data) {
      fontState.setFont(query.data);
      setReady();
    }
  }, [query.data]);

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

  const selected = fontState.selectedGlyphId;

  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const replaceCommands = useFontStore((state) => state.replaceCommands);
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

      case "commands.delete":
      case "commands.add":
        replaceCommands(history.payload[key]);
        break;
    }
  });

  const getFont = useFreshSelector(useFontStore, (state) => state.font);

  const [getSelected] = useFresh(selected);

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
      fontState.setSelectedGlyph(queryGlyph);
      return;
    }
    const id = font.glyphs.ids[Math.floor(font.glyphs.ids.length / 4)];

    if (id) {
      fontState.setSelectedGlyph(id);
    }
  }, [query.isLoading, query.isSuccess, router.query.glyph]);

  const updateCommands = useCallback(
    (commands: Record<string, Command>) => {
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

  const setViewMode = (viewMode: ViewMode) => {
    setSettings((settings) => ({
      ...settings,
      viewMode: viewMode,
    }));
  };

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
  const leftSidebar = useWorkspaceStore((state) => state.leftSidebar);
  const [toggleRightSidebarSide, rightSidebar] = useWorkspaceStore(
    (state) => [state.toggleRightSidebarSide, state.rightSidebar],
    shallow
  );

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

  if (query.isLoading || !isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-xl font-light flex-col space-y-4">
        <div className="animate-spin w-8 h-8 bg-gray-200" />
        <h1>Font is loading</h1>
      </div>
    );
  }

  const glyph = glyphs.items[selected];

  return (
    <div className="h-screen flex flex-col bg-white  overflow-hidden select-none">
      <Header />

      <div className="flex flex-1 h-full overflow-hidden">
        {leftSidebar && (
          <GlyphList font={font} glyphs={glyphs} selected={selected} />
        )}

        {isReady && (
          <KeyboardEventsProvider className="flex-1 relative w-full focus:outline-none  overflow-hidden">
            <div className="absolute left-10 bottom-4 z-50">
              <ToOpenType selected={selected} />
            </div>

            <div className="flex absolute left-10 top-10 z-50">
              <Button
                roundedR={false}
                onClick={history.undo}
                disabled={!history.canUndo}
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.375 10.4056H14.625C16.0723 10.4056 17.25 11.5916 17.25 13.049C17.25 14.5063 16.0723 15.6923 14.625 15.6923H12V17.4545H14.625C17.0374 17.4545 19 15.4782 19 13.049C19 10.6197 17.0374 8.64336 14.625 8.64336H9.375V6L5 9.52448L9.375 13.049V10.4056Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
              <Button
                roundedL={false}
                onClick={history.redo}
                disabled={!history.canRedo}
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.375 17.375H12V15.625H9.375C7.92775 15.625 6.75 14.4472 6.75 13C6.75 11.5527 7.92775 10.375 9.375 10.375H14.625V13L19 9.5L14.625 6V8.625H9.375C6.96262 8.625 5 10.5876 5 13C5 15.4124 6.96262 17.375 9.375 17.375Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </div>

            <div className="absolute right-4 top-10 z-50 flex">
              <DownloadSvgButton />

              <Button roundedL={false} className="px-3 pr-2 relative">
                Replace .SVG
                <input
                  onChange={onImport}
                  className="opacity-0 inset-0 absolute w-full h-full cursor-pointer"
                  type="file"
                />
                <svg
                  className="w-8 h-8 ml-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.3 13.7H12.7V9.5H14.8L12 6L9.2 9.5H11.3V13.7Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.6 15.8H6.4V10.9H5V15.8C5 16.5721 5.6279 17.2 6.4 17.2H17.6C18.3721 17.2 19 16.5721 19 15.8V10.9H17.6V15.8Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>

              <Button onClick={toggleRightSidebarSide} className="ml-4">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M5 8.68h14V9.8H5zM5 14.28h14v1.12H5z"
                  />
                  <circle cx="15.08" cy="9.24" r="2.24" fill="currentColor" />
                  <circle cx="8.92" cy="14.84" r="2.24" fill="currentColor" />
                </svg>
              </Button>
            </div>

            <div className="absolute right-4 top-20 mt-2 z-50 flex flex-col">
              <Button
                className="w-8"
                active={settings.viewMode === "outline"}
                roundedB={false}
                onClick={() => setViewMode("outline")}
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="4"
                    transform="rotate(-90 8 8)"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </Button>
              <Button
                className="w-8"
                active={settings.viewMode === "solid"}
                roundedT={false}
                onClick={() => setViewMode("solid")}
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="4"
                    transform="rotate(-90 8 8)"
                    fill="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </Button>
              <NodeTransform />
            </div>
            <Editor history={history} settings={settings} />
          </KeyboardEventsProvider>
        )}

        {rightSidebar && (
          <div className="bg-white w-64 w-full h-full shadow-xl border-l border-gray-300 p-4 space-y-4">
            <div>
              <label className="text-sm uppercase text-gray-700">
                Grid size
              </label>
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

            <FlipButtons />
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
        )}
      </div>
    </div>
  );
};

export default App;
