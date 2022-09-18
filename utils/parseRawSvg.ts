import { parse, Node, RootNode } from "svg-parser";
import svgPath from "svgpath";
import { Command, PointTuple } from "../types";
import makeCubicPayload from "./makeCubicPayload";
import { parseStringSvgPath } from "./parseStringSvgPath";
import quadraticToQubic from "./quadraticToCubic";

const scanForPaths = (node: Node | RootNode) => {
  let results: string[] = [];

  if (node.type !== "root" && node.type !== "element") {
    return [];
  }

  for (let child of node.children) {
    if (typeof child !== "string") {
      results = [...results, ...scanForPaths(child)];
    }
  }

  if (node.type === "element") {
    if (node.tagName === "path" && typeof node.properties?.d === "string") {
      results.push(node.properties?.d);
    }
  }

  return results;
};

export default function parseRawSvg(
  svg: string,
  baseWidth: number,
  baseHeight: number
) {
  const parsed = parse(svg);

  const paths = scanForPaths(parsed).join(" ");

  return parseStringSvgPath(paths, baseWidth, baseHeight);
}
