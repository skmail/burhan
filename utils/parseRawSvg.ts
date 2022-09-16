import { parse, Node, RootNode } from "svg-parser";
import svgPath from "svgpath";
import { Command, PointTuple } from "../types";
import makeCubicPayload from "./makeCubicPayload";
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

  let result: Command[] = [];
  const path = svgPath(paths).abs().unshort().unarc();

  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  path.iterate((segment) => {
    const [command, ...points] = segment;
    let pts = points;
    for (var j = 0; j < points.length; j += 2) {
      if (pts[j + 0] < bounds[0]) bounds[0] = pts[j + 0];
      if (pts[j + 1] < bounds[1]) bounds[1] = pts[j + 1];
      if (pts[j + 0] > bounds[2]) bounds[2] = pts[j + 0];
      if (pts[j + 1] > bounds[3]) bounds[3] = pts[j + 1];
    }
  });

  let [left, top, right, bottom] = bounds;

  const width = right - left;
  const height = bottom - top;
  let sx = baseWidth / width;
  let sy = baseHeight / height;
  const scale = Math.min(Math.abs(sx), Math.abs(sy));

  path.scale(scale).iterate((segment) => {
    const [command, ...args] = segment;
    const id = String(Math.random());
    switch (command) {
      case "M":
        result.push({
          id,
          command: "moveTo",
          args: args as PointTuple,
        });
        break;
      case "L":
        result.push({
          id,
          command: "lineTo",
          args: args as PointTuple,
        });
        break;

      case "H":
        result.push({
          id,
          command: "lineTo",
          //@ts-ignore
          args: [args[0], result[result.length - 1].args[1]],
        });
        break;
      case "V":
        result.push({
          id,
          command: "lineTo",
          //@ts-ignore
          args: [result[result.length - 1].args[0], args[0]],
        });
        break;
      case "C":
        result = [
          ...result,
          ...makeCubicPayload(
            args as [number, number, number, number, number, number]
          ),
        ];
        break;

      case "Q":
        const prev: PointTuple = result[result.length - 1].args;
        const quad = args as [number, number, number, number];
        result = [...result, ...makeCubicPayload(quadraticToQubic(prev, quad))];
        break;
      case "Z":
        result.push({
          id,
          command: "closePath",
          args: [] as any,
        });
        break;
    }
  });

  return result.map((command) => {
    if (command.args.length) {
      command.args[0] -= left * scale;
      command.args[1] -= bottom * scale;
    }

    console.log(command.args);
    return command;
  });
}
