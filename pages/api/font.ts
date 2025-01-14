import {
  BBOX,
  create as createFont,
  Font,
  FontCollection,
  PathCommand,
} from "fontkit";
import { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { Files, IncomingForm } from "formidable";
import { readFileSync } from "fs";
import axios from "axios";
import { Glyph } from "opentype.js";

const idsTable: Record<string, string> = {};
export const config = {
  api: {
    bodyParser: false,
  },
};
const uniqueId = () => {
  const id = randomUUID();

  if (idsTable[id]) {
    return uniqueId();
  }

  return id;
};

const samples = {
  0: "https://fonts.gstatic.com/s/eduvicwantbeginner/v1/jiz2RF1BuW9OwcnNPxLl4KfZCHd9nFtd5Tu7stCpElYpvPfZZ-OXlMmCVQ7LlPGQh1g.woff",
  1: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
  2: "https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ys43PW5fslBEg0.woff2",
  3: "https://fonts.gstatic.com/s/notosansjp/v42/-F6pfjtqLzI2JPCgQBnw7HFQaioq131nj-pXANNwpfqCt9pay6XIBdsAJNIhVEwQ.0.woff2",
  4: "https://fonts.gstatic.com/s/russoone/v14/Z9XUDmZRWg6M1LvRYsHOz8mJvLuL9A.woff2",
};

class UserError extends Error {}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const buffer = await getBufferFromRequest(req);

    const font = createFromBuffer(buffer);

    if (font.glyphs.length === 0) {
      throw new UserError("Unable to parse the font glyphs");
    }

    res.status(200).json(font);
  
  } catch (error) {
    if (error instanceof UserError) {
      res.status(400).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: `Something went wrong`,
      });
    }
  }
}

const getBufferFromRequest = async (req: NextApiRequest) => {
  const body = await new Promise<{
    fields: Record<string, unknown>;
    files: Files;
  }>((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject({ err });
      resolve({
        files,
        fields: Object.fromEntries(
          Object.entries(fields).map(([name, value]) => [name, value?.[0]])
        ),
      });
    });
  });

  if (body.files.file) {
    return readFileSync(body.files.file[0].filepath);
  } else if (body.fields.url) {
    return await loadFontUrl(body.fields.url as string);
  } else if (body.fields.sample !== undefined) {
    const sampleIndex = parseInt(body.fields.sample as string);
    if (sampleIndex === undefined) {
      throw new UserError("Sample");
    }
    const sample = samples[sampleIndex as keyof typeof samples];

    if (!sample) {
      throw new UserError("Font sample not found");
    }
    return await loadFontUrl(sample);
  }

  throw new UserError("Unable to parse the font");
};

function assertFontOnly(font: Font | FontCollection): asserts font is Font {
  if (["TTC", "DFont"].includes(font.type)) {
    throw new UserError("Font collections are not supportd");
  }
}
const createFromBuffer = (buffer: Buffer) => {
  const font = createFont(buffer);

  assertFontOnly(font);

  const {
    postscriptName,
    fullName,
    familyName,
    subfamilyName,
    copyright,
    version,

    unitsPerEm,
    ascent,
    descent,
    lineGap,
    underlinePosition,
    underlineThickness,
    italicAngle,
    capHeight,
    xHeight,
    bbox,
    numGlyphs,
    characterSet,
    availableFeatures,
  } = font;

  type ResponsePathCommand = Omit<PathCommand, "command"> & {
    id: string;
    args: (string | number)[];
    command: string;
  };
  type ResponseGlyph = {
    string: string;
    id: string;
    character: number;
    codePoint: number;
    codePoints: number[] | number;
    name: string;
    path: Omit<Glyph["path"], "commands"> & {
      commands: ResponsePathCommand[];
    };
    bbox: typeof bbox;
    advanceWidth: number;
    cbox: BBOX;
    metrics: any;
  };
  const glyphs = characterSet.reduce<ResponseGlyph[]>((acc, character) => {
    const string = String.fromCodePoint(character);
    if (!string) {
      return acc;
    }
    try {
      if (!font.hasGlyphForCodePoint(character)) {
        console.log("no glyph for this codepoint", character);
        return acc;
      }
      const glyph = font.glyphForCodePoint(character);

      acc.push({
        string,
        id: uniqueId(),
        character,
        codePoint: character,
        codePoints: !glyph.codePoints.length ? [character] : glyph.codePoints,
        name: glyph.name,
        path: {
          ...glyph.path,
          commands: glyph.path.commands.reduce<ResponsePathCommand[]>(
            (acc, command) => {
              if (command.command === "quadraticCurveTo") {
                console.log(command);
                acc.push({
                  ...command,
                  command: "quadraticCurveToCP",
                  args: [command.args[0], command.args[1]],
                  id: uniqueId(),
                });
                acc.push({
                  ...command,
                  args: [command.args[2], command.args[3]],
                  id: uniqueId(),
                });
              } else if (command.command === "bezierCurveTo") {
                acc.push({
                  ...command,
                  command: "bezierCurveToCP1",
                  args: [command.args[0], command.args[1]],
                  id: uniqueId(),
                });
                acc.push({
                  ...command,
                  command: "bezierCurveToCP2",
                  args: [command.args[2], command.args[3]],
                  id: uniqueId(),
                });
                acc.push({
                  ...command,
                  args: [command.args[4], command.args[5]],
                  id: uniqueId(),
                });
              } else {
                acc.push({
                  ...command,
                  id: uniqueId(),
                });
              }

              return acc;
            },
            []
          ),
        },
        bbox: {
          ...glyph.bbox,
          width: glyph.bbox.width,
          height: glyph.bbox.height,
        },
        cbox: glyph.cbox,
        advanceWidth: glyph.advanceWidth,
        //@ts-ignore
        _metrics: glyph._metrics,
      });
    } catch (error) {
      console.log("unable to parse codepoint", character);
    }
    return acc;
  }, []);

  return {
    id: uniqueId(),
    unitsPerEm,
    ascent,
    descent,
    lineGap,
    underlinePosition,
    underlineThickness,
    italicAngle,
    capHeight,
    xHeight,

    postscriptName,
    fullName,
    familyName,
    subfamilyName,
    copyright,
    version,

    bbox: {
      ...bbox,
      width: bbox.width,
      height: bbox.height,
    },

    numGlyphs,
    availableFeatures,
    glyphs,
  };
};
const loadFontUrl = async (url: string) => {
  const response = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
    timeout: 2000,
  });

  return response.data;
};
