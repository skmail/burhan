import type { NextPage } from "next";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Svg from "../components/Svg";
import { Font } from "../types";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";
import { Transition } from "@headlessui/react";
import Button from "../components/Button";

const Editor = dynamic(() => import("../components/Editor"), { ssr: false });

const getFont = async ({ queryKey }: any) => {
  const response = await axios.get(`/fonts/${queryKey[1]}.json`);

  const normalize = <T extends { id: string }>(
    data: T[],
    itemUpdater?: (item: T) => T
  ) => {
    return data.reduce(
      (acc, item) => {
        acc.ids.push(item.id);

        if (itemUpdater) {
          item = itemUpdater(item);
        }

        acc.items[item.id] = item;

        return acc;
      },
      {
        ids: [] as string[],
        items: {} as Record<string, T>,
      }
    );
  };

  return {
    ...response.data,
    glyphs: normalize(response.data.glyphs, (glyph: any) => {
      return {
        ...glyph,
        path: {
          ...glyph.path,
          commands: normalize(glyph.path.commands),
        },
      };
    }),
  };
};
const Home: NextPage = () => {
  const [sample, setFontSample] = useState(0);

  const query = useQuery<Font>(["font", sample], getFont, {
    staleTime: Infinity,
  });

  const queryClient = useQueryClient();
  const [isSidebarOpened, setIsSidebarOpened] = useState(true);
  const [isOptionsOpened, setIsOptionsOpened] = useState(false);
  const [forceUpdater, setForceUpdater] = useState("");
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);

  const dataRef = useRef<Font>();
  dataRef.current = query.data;
  useEffect(() => {
    if (query.isLoading || !query.isSuccess) {
      return;
    }
    const id =
      dataRef.current?.glyphs.ids[
        Math.floor(dataRef.current?.glyphs.ids.length / 4)
      ];

    if (id) {
      setSelected(id);
    }
  }, [query.isLoading, query.isSuccess]);
  const [selected, setSelected] = useState<string>("50");
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
      </div>
    );
  }

  const { glyphs, ...font } = query.data;

  const glyph = glyphs.items[selected];

  return (
    <div className="h-screen flex  overflow-hidden">
      <Button
        onClick={(e) => {
          setIsSidebarOpened((b) => !b);
          setForceUpdater(String(Math.random()));
        }}
        className={`fixed bottom-2 z-50 ${
          isSidebarOpened ? "left-[240px] ml-2" : "left-2"
        }`}
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
          <g transform="translate(0, 3)">
            <rect width="32" height="6" rx="4" />
            <rect y="10" width="32" height="6" rx="4" />
            <rect y="20" width="32" height="6" rx="4" />
            <rect y="10" width="32" height="6" rx="4" />
          </g>
        </svg>
      </Button>
      <Transition
        show={isSidebarOpened}
        appear
        enter="transition-all  duration-200"
        enterFrom="w-0"
        enterTo="w-[240px]"
        leave="transition-all duration-200"
        leaveFrom="w-[240px]"
        leaveTo="w-0"
        afterLeave={() => {
          setForceUpdater(String(Math.random()));
        }}
        afterEnter={() => {
          setForceUpdater(String(Math.random()));
        }}
      >
        <div className="flex overflow-hidden border-r  border-slate-400 shadow-sm">
          <div className="w-12 flex flex-col p-2 bg-gray-100 flex-shrink-0 space-y-4">
            {[0, 1, 2, 3, 4, 5].map((button) => (
              <Button
                key={button}
                variant={
                  String(button) === String(sample) ? "secondary" : "primary"
                }
                onClick={() => {
                  setFontSample(button);
                  setSelectedHandles([]);
                }}
              >
                {button}
              </Button>
            ))}
          </div>
          <div className={`flex gap-4 flex-wrap p-4 h-screen  overflow-y-auto`}>
            {glyphs.ids.map((id) => {
              const glyph = glyphs.items[id];
              return (
                <div
                  key={id}
                  onClick={() => {
                    setSelected(glyph.id);
                  }}
                  className={`ring p-0.5 ${
                    selected === glyph.id
                      ? "ring-orange-500"
                      : "ring-slate-300  hover:ring-indigo-600"
                  } relative cursor-pointer`}
                >
                  <Svg
                    metrics={false}
                    font={font}
                    glyph={glyph}
                    width={38}
                    height={38}
                    fill
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Transition>
      <div className="flex-1  w-full  overflow-hidden">
        {!!glyph && (
          <Editor
            forceUpdate={forceUpdater}
            onCommandsUpdate={(commands) => {
              const data = {
                ...query.data,
                glyphs: {
                  ...query.data.glyphs,
                  items: {
                    ...query.data.glyphs.items,
                    [selected]: {
                      ...query.data.glyphs.items[selected],
                      path: {
                        ...query.data.glyphs.items[selected].path,
                        commands: {
                          ...query.data.glyphs.items[selected].path.commands,
                          items: {
                            ...query.data.glyphs.items[selected].path.commands
                              .items,
                            ...commands,
                          },
                        },
                      },
                    },
                  },
                },
              };

              queryClient.setQueryData(["font", sample], data);
            }}
            onCommandUpdate={(command) => {
              const data = {
                ...query.data,
                glyphs: {
                  ...query.data.glyphs,
                  items: {
                    ...query.data.glyphs.items,
                    [selected]: {
                      ...query.data.glyphs.items[selected],
                      path: {
                        ...query.data.glyphs.items[selected].path,
                        commands: {
                          ...query.data.glyphs.items[selected].path.commands,
                          items: {
                            ...query.data.glyphs.items[selected].path.commands
                              .items,
                            [command.id]: command,
                          },
                        },
                      },
                    },
                  },
                },
              };

              queryClient.setQueryData(["font", sample], data);
            }}
            onSelectHandles={(ids: string[]) => {
              setSelectedHandles(ids);
            }}
            font={font}
            glyph={glyph}
            selectedHandles={selectedHandles}
          />
        )}
      </div>

      <Button
        onClick={(e) => {
          setIsOptionsOpened((b) => !b);
          setForceUpdater(String(Math.random()));
        }}
        className={`fixed top-2  z-50 ${
          isOptionsOpened ? "right-[240px]  mr-2" : "right-2"
        }`}
      >
        {isOptionsOpened ? (
          <ArrowRightIcon className="h-5 w-5" />
        ) : (
          <ArrowLeftIcon className="h-5 w-5" />
        )}
      </Button>
      <Transition
        show={isOptionsOpened}
        appear
        enter="transition-all  duration-200"
        enterFrom="w-0"
        enterTo="w-[240px]"
        leave="transition-all duration-200"
        leaveFrom="w-[240px]"
        leaveTo="w-0"
        afterLeave={() => {
          setForceUpdater(String(Math.random()));
        }}
        afterEnter={() => {
          setForceUpdater(String(Math.random()));
        }}
      >
        <div className="bg-white w-fullx h-full shadow-xl border-l border-gray-300 p-4 text-xl font-thin text-gray-400">
          Here{"'"}s is the future options
        </div>
      </Transition>

      {/* <ImageTest /> */}
    </div>
  );
};

export default Home;
