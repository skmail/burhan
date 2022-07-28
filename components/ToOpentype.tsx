import { useEffect, useState } from "react";
import useFresh from "../hooks/useFresh";
import { Font } from "../types";
import toOpentype from "../utils/toOpentype";

export default function ToOpenType({
  font,
  selected,
}: {
  font: Font;
  selected: string;
}) {
  const [fontStyle, setFontStyle] = useState("");
  const [testData, setTestData] = useState<string>();
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const url = toOpentype(font);

    const style = `
    @font-face {font-family: "XXX";src: url("${url}") format("opentype");}
    `;

    setFontStyle(style);
  }, [font]);

  const getIsChanged = useFresh(isChanged);

  useEffect(() => {
    if (font.glyphs.items[selected] && (!getIsChanged() || !testData)) {
      setTestData(font.glyphs.items[selected].string);
    }
  }, [selected, font, testData]);
  return (
    <>
      {!!fontStyle && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: fontStyle,
            }}
          ></style>

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
            className="h-24 text-2xl ring focus:outline-none ring-zinc-800 rounded p-2 shadouw  w-64 bg-white "
          ></textarea>
        </>
      )}
    </>
  );
}
