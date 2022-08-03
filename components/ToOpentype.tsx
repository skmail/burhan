import { useEffect, useRef, useState } from "react";
import useFresh from "../hooks/useFresh";
import { useFontStore } from "../store/font/reducer";
import { Font } from "../types";
import toOpentype from "../utils/toOpentype";
import { FontGeneratorWorker } from "../workers/font-generator";
import Button from "./Button";

export default function ToOpenType({ selected }: { selected: string }) {
  const [testData, setTestData] = useState<string>();
  const [isChanged, setIsChanged] = useState(false);
  const [fontUrl, setFontUrl] = useState("");
  const [isLoding, setIsLoading] = useState(false);
  const font = useFontStore((state) => state.font);
  const setDownloadUrl = useFontStore((state) => state.setDownloadUrl);

  const worker = useRef<FontGeneratorWorker>();

  useEffect(() => {
    worker.current = new FontGeneratorWorker();
    worker.current.on("done", (message) => {
      if (message.type === "done") {
        setFontUrl(message.url);
        setIsLoading(false);
        setDownloadUrl(message.url);
      }
    });
    return () => {
      if (worker.current) {
        worker.current.destroy();
        setDownloadUrl("");
      }
    };
  }, []);

  useEffect(() => {
    if (!font) {
      return;
    }
    const timer = setTimeout(() => {
      setIsLoading(true);
      worker.current?.run(font);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [font]);

  const [getIsChanged] = useFresh(isChanged);

  useEffect(() => {
    if (!font) {
      return;
    }
    if (font.glyphs.items[selected] && (!getIsChanged() || !testData)) {
      setTestData(font.glyphs.items[selected].string);
    }
  }, [selected, font, testData]);

  if (!font) {
    return null;
  }
  return (
    <>
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face {font-family: "XXX";src: url("${fontUrl}") format("opentype");}`,
          }}
        ></style>

        <div className="flex flex-col items-start relative">
          <span className="text-sm uppercase   py-0.5 mb-2 text-icon text-xs text-white absolute top-2 left-2">
            Font testing
          </span>

          {isLoding && (
            <div className="animate-spin w-4 h-4 bg-gray-200 absolute right-2 top-2" />
          )}

          <textarea
            onMouseMove={(e) => e.stopPropagation()}
            style={{
              fontFamily: "'XXX'",
            }}
            value={testData}
            onChange={(e) => {
              setIsChanged(
                e.target.value !== font.glyphs.items[selected].string
              );
              setTestData(e.target.value);
            }}
            placeholder="Test your data here"
            className="h-24 text-2xl ring focus:outline-none ring-outline rounded-lg p-2 w-64 bg-white pt-9 "
          ></textarea>
        </div>
      </>
    </>
  );
}
