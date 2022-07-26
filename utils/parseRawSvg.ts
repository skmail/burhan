import { parse, Node, RootNode } from "svg-parser";
import svgPath from "svgpath";
import { Command } from "../types";

const scanForPaths = (node: Node | RootNode) => {
  let results: string[] = [];
  console.log(node);
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

  const result = scanForPaths(parsed).map((p) => {
    const result: Command[] = [];

    const path = svgPath(p).abs().unshort();

    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    path.iterate((segment) => {
      const [command, ...points] = segment;
      for (var j = 0; j < points.length; j += 2) {
        if (points[j + 0] < bounds[0]) bounds[0] = points[j + 0];
        if (points[j + 1] < bounds[1]) bounds[1] = points[j + 1];
        if (points[j + 0] > bounds[2]) bounds[2] = points[j + 0];
        if (points[j + 1] > bounds[3]) bounds[3] = points[j + 1];
      }
    });

    let [left, top, right, bottom] = bounds;

    const sx = baseWidth / (right - left);
    const sy = baseHeight / (bottom - top);

    path.scale(sx, sy).iterate((segment) => {
      const [command, ...args] = segment;

      const id = String(Math.random());

      switch (command) {
        case "M":
          result.push({
            id,
            command: "moveTo",
            args,
          });
          break;
        case "L":
          result.push({
            id,
            command: "lineTo",
            args,
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
          result.push({
            id: String(Math.random()),
            command: "bezierCurveToCP1",
            //@ts-ignore
            args: [args[0], args[1]],
          });
          result.push({
            id: String(Math.random()),
            command: "bezierCurveToCP2",
            //@ts-ignore
            args: [args[2], args[3]],
          });
          result.push({
            id: String(Math.random()),
            command: "bezierCurveTo",
            //@ts-ignore
            args: [args[4], args[4]],
          });
          break;

        case "Q":
          result.push({
            id: String(Math.random()),
            command: "quadraticCurveToCP",
            //@ts-ignore
            args: [args[0], args[1]],
          });
          result.push({
            id: String(Math.random()),
            command: "quadraticCurveTo",
            //@ts-ignore
            args: [args[2], args[3]],
          });
          break;
      }
    });

    console.log(path);
    console.log(result);
    return result;
  });

  return result[0];
}
