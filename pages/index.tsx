import type { NextPage } from "next";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Svg from "../components/Svg";
import { Font } from "../types";
import { useState } from "react";
import Editor from "../components/Editor";

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
  const query = useQuery<Font>(["todos"], getFont);

  const [selected, setSelected] = useState<string>("35");
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
      <div className="flex gap-4 flex-wrap p-4 h-full w-64 overflow-y-auto border-r border-gray-400 shadow-sm">
        {glyphs.map((glyph) => {
          return (
            <div
              onClick={() => setSelected(glyph.id)}
              className={`ring ${
                selected === glyph.id
                  ? "ring-orange-500"
                  : "ring-sky-500 ver:ring-sky-60"
              } relative p-4 ho0 cursor-pointer`}
              key={glyph.id}
            >
              {/* <span className="absolute bottom-2 right-2 bg-sky-500 text-white rounded px-2">
                {glyph.string}
              </span> */}
              <Svg
                metrics={false}
                x={-100}
                y={300}
                font={font}
                glyph={glyph}
                fontSize={2500}
                size={30}
                fill
              />
            </div>
          );
        })}
      </div>

      <div className="flex-1  w-full  overflow-hidden">
        {!!glyph && <Editor font={font} glyph={glyph} />}
      </div>
    </div>
  );
};

export default Home;
