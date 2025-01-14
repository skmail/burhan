import { selectSelectedGlyph, useFontStore } from "../store/font/reducer";
import { Font } from "../types";

export default function GlyphInfo() {
  const glyph = useFontStore(selectSelectedGlyph);

  if (!glyph) {
    return null;
  }
  
  return (
    <div>
      <div className="bg-gray-100 -mx-4 px-2 py-1 text-gray-700 border-y border-gray-10">
        GlyphInfo
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 font-medium mr-4">Character </div>
          <div className="bg-gray-100 shadow px-2 rounded">{glyph.string}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-gray-600 font-medium mr-4">Character Code</div>
          <div>{glyph.codePoints.map((c) => c)}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-600 font-medium mr-4">Advance Width</div>
          <div>{glyph._metrics.advanceWidth}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-600 font-medium mr-4">Left Bearing</div>
          <div>{glyph._metrics.leftBearing}</div>
        </div>
      </div>
    </div>
  );
}
