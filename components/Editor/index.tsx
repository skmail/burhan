import { useEffect, useRef, useState } from "react";
import { Bounds, Font } from "../../types";
import Svg from "../Svg";
 
interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"][0];
}
export default function Editor({ font, glyph }: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !ref.current.parentElement) {
      return;
    }

    const parent = ref.current.parentElement;

    setBounds({
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    });

    const onResize = () => {
      setBounds({
        width: parent.offsetWidth,
        height: parent.offsetHeight,
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="bg-gray-200"
      style={{
        width: bounds.width,
        height: bounds.height,
      }}
      ref={ref}
    >
      <Svg
        font={font}
        glyph={glyph}
        fill
        width={bounds.width}
        height={bounds.height}
      />
    </div>
  );
}
