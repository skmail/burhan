import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const codePoint = parseInt(req.query.codePoint as string);

  if (isNaN(codePoint)) {
    return res.status(400).json({ message: "invalid code point." });
  }

  const baseDirectory = "storage/unicodes/";
  const file = baseDirectory + `${codePoint}.json`;

  if (!existsSync(baseDirectory)) {
    createFolderRecursively(baseDirectory);
  }
  if (existsSync(file)) {
    const data = readFileSync(file, "utf-8");
    res.status(200).json(JSON.parse(data));
    return;
  }

  const response = await axios.get(
    `https://unicodelookup.com/lookup?q=${codePoint}&o=0`
  );

  const result = response.data.results[0];

  const data = {
    oct: result[0],
    dec: result[1],
    hex: result[2],
    html: result[3],
    char: result[4],
    name: result[5],
  };

  writeFileSync(file, JSON.stringify(data));

  res.status(200).json(data);
}
function createFolderRecursively(path: string) {
  try {
    mkdirSync(path, { recursive: true });
    console.log(`Directory '${path}' created successfully!`);
  } catch (err) {
    console.error(`Error creating directory '${path}':`, err);
  }
}
