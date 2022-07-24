import type { NextPage } from "next";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Svg from "../components/Svg";
import { Font, Handle } from "../types";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import updateCommand from "../utils/updateCommand";

const Editor = dynamic(() => import("../components/Editor"), { ssr: false });

const getFont = async () => {
  const response = await axios.get("http://localhost:8080");

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
  const query = useQuery<Font>(["font"], getFont, {
    networkMode: "always",
  });
  useEffect(() => {
    query.refetch();
  }, []);
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<string>("70");
  if (query.isLoading) {
    return <div>Font is loading</div>;
  }

  if (query.isError) {
    return <div className="text-red-500">Unable to load it</div>;
  }
  const { glyphs, ...font } = query.data;

  const glyph = glyphs.items[selected];

  return (
    <div className="h-screen flex  overflow-hidden">
      <div className="flex gap-4 flex-wrap p-4 h-full w-64 overflow-y-auto border-r border-slate-400 shadow-sm">
        {glyphs.ids.map((id) => {
          const glyph = glyphs.items[id];
          return (
            <div
              key={id}
              onClick={() => setSelected(glyph.id)}
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
                width={52}
                height={52}
                fill
              />
            </div>
          );
        })}
      </div>

      <div className="flex-1  w-full  overflow-hidden">
        {!!glyph && (
          <Editor
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

              queryClient.setQueryData(["font"], data);
            }}
            font={font}
            glyph={glyph}
          />
        )}
      </div>

      <div className="bg-white w-72 shadow-xl border-l border-gray-300 p-4 text-xl font-thin text-gray-400">
        Here's is the future options
      </div>
    </div>
  );
};

export default Home;
