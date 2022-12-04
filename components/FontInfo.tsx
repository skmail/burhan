import { Font } from "../types";

interface Props {
  font: Font;
}
export default function FontInfo({ font }: Props) {
  return (
    <div>
      <div className="bg-gray-100 -mx-4 px-2 py-1 text-gray-500 border-y border-gray-10">
        Font Info
      </div>

      <div className="mt-4 space-y-2">
        <div className="">
          <div className="text-gray-600 font-medium mr-4">ascent</div>
          <div className="text-sm text-gray-500">{font.ascent}</div>
        </div>

        <div className="">
          <div className="text-gray-600 font-medium mr-4">capHeight</div>
          <div className="text-sm text-gray-500">{font.capHeight}</div>
        </div>

        <div className="">
          <div className="text-gray-600 font-medium mr-4">xHeight</div>
          <div className="text-sm text-gray-500">{font.xHeight}</div>
        </div>

        <div className="">
          <div className="text-gray-600 font-medium mr-4">lineGap</div>
          <div className="text-sm text-gray-500">{font.lineGap}</div>
        </div>

        {!!font.postscriptName && (
          <div className=" ">
            <div className="text-gray-600 font-medium mr-4">
              Postscript name
            </div>
            <div className="text-sm text-gray-500">{font.postscriptName}</div>
          </div>
        )}
        <div className="">
          <div className="text-gray-600 font-medium mr-4">Family name</div>
          <div className="text-sm text-gray-500">{font.familyName}</div>
        </div>

        <div>
          <div className="text-gray-600 font-medium mr-4">Subfamily name</div>
          <div className="text-sm text-gray-500">{font.subfamilyName}</div>
        </div>

        <div>
          <div className="text-gray-600 font-medium mr-4">Copyright</div>
          <div className="text-sm text-gray-500">{font.copyright}</div>
        </div>

        <div>
          <div className="text-gray-600 font-medium mr-4">Version</div>
          <div className="text-sm text-gray-500">{font.version}</div>
        </div>
      </div>
    </div>
  );
}
