import type { NextPage } from "next";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Svg from "../components/Svg";
import { Font, Handle } from "../types";
import { useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../components/Editor"), { ssr: false });
const uniqueId = () => {
  return String(Math.random());
};

const getFont = async () => {
  const response = await axios.get<Font>("http://localhost:8080");
  return {
    ...response.data,
    glyphs: response.data.glyphs.map((glyph, index) => ({
      ...glyph,
      // id: uniqueId(),
      id: String(index),
      path: {
        ...glyph.path,
        commands: glyph.path.commands.map((command) => ({
          ...command,
          id: uniqueId(),
        })),
      },
    })),
  };
};
const Home: NextPage = () => {
  const query = useQuery<Font>(["font"], getFont);
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<string>("55");
  if (query.isLoading) {
    return <div>Font is loading</div>;
  }

  if (query.isError) {
    return <div className="text-red-500">Unable to load it</div>;
  }
  const { glyphs, ...font } = query.data;

  const glyph = glyphs.find((glyph) => glyph.id === selected);
  return (
    <div className="h-screen flex  overflow-hidden">
      <div className="flex gap-4 flex-wrap p-4 h-full w-64 overflow-y-auto border-r border-slate-400 shadow-sm">
        {glyphs.map((glyph) => {
          return (
            <div
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
            onHandleDrag={(handle) => {
              const getValue = (
                handle: Handle,
                index: 0 | 1,
                type: Handle["type"]
              ) => {
                return handle.type == type ? handle.points[index] : 0;
              };
              const data = {
                ...query.data,
                glyphs: query.data.glyphs.map((glyph) => {
                  if (glyph.id !== selected) {
                    return glyph;
                  }

                  return {
                    ...glyph,
                    path: {
                      ...glyph.path,
                      commands: glyph.path.commands.map((command) => {
                        if (command.id !== handle.id) {
                          return command;
                        }

                        switch (command.command) {
                          case "bezierCurveTo":
                            return {
                              ...command,
                              args: [
                                command.args[0] +
                                  getValue(handle, 0, "cubicBezier1"),
                                command.args[1] +
                                  getValue(handle, 1, "cubicBezier1"),
                                command.args[2] +
                                  getValue(handle, 0, "cubicBezier2"),
                                command.args[3] +
                                  getValue(handle, 1, "cubicBezier2"),
                                command.args[4] + getValue(handle, 0, "point"),
                                command.args[5] + getValue(handle, 1, "point"),
                              ],
                            };

                          case "lineTo":
                          case "moveTo":
                            return {
                              ...command,
                              args: [
                                command.args[0] + handle.points[0],
                                command.args[1] + handle.points[1],
                              ],
                            };
                          case "quadraticCurveTo":
                            return {
                              ...command,
                              args: [
                                command.args[0] +
                                  getValue(handle, 0, "quadraticBezier"),
                                command.args[1] +
                                  getValue(handle, 1, "quadraticBezier"),
                                command.args[2] + getValue(handle, 0, "point"),
                                command.args[3] + getValue(handle, 1, "point"),
                              ],
                            };
                            break;
                          default:
                            return command;
                        }
                      }),
                    },
                  };
                }),
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
