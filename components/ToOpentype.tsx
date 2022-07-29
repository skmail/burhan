import { useEffect, useState } from "react";
import useFresh from "../hooks/useFresh";
import { Font } from "../types";
import toOpentype from "../utils/toOpentype";
import Button from "./Button";

export default function ToOpenType({
  font,
  selected,
}: {
  font: Font;
  selected: string;
}) {
  const [testData, setTestData] = useState<string>();
  const [isChanged, setIsChanged] = useState(false);
  const [fontUrl, setFontUrl] = useState("");
  useEffect(() => {
    const url = toOpentype(font);

    setFontUrl(url);
  }, [font]);

  const getIsChanged = useFresh(isChanged);

  useEffect(() => {
    if (font.glyphs.items[selected] && (!getIsChanged() || !testData)) {
      setTestData(font.glyphs.items[selected].string);
    }
  }, [selected, font, testData]);
  if (!fontUrl) {
    return null;
  }
  return (
    <>
      <Button
        onClick={() => {
          const familyName = font.familyName;
          const styleName = font.subfamilyName;
          const fileName =
            familyName.replace(/\s/g, "") + "-" + styleName + ".otf";
          const link = document.createElement("a");
          link.href = fontUrl;
          link.download = fileName;
          link.click();
        }}
      >
        Download
      </Button>

      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face {font-family: "XXX";src: url("${fontUrl}") format("opentype");}`,
          }}
        ></style>

        <div className="flex flex-col items-start relative">
          <span className="text-sm uppercase mb-1 px-2 py-0.5 mb-2 bg-red-500 text-white absolute top-2 left-2">
            Font testing
          </span>
          <textarea
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
            className="h-24 text-2xl ring focus:outline-none ring-zinc-800 rounded p-2 shadouw  w-64 bg-white pt-9 "
          ></textarea>
        </div>
      </>
    </>
  );
}
