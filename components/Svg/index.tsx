import svgpath, { round } from "svgpath";
import { Font, Command } from "../../types";
import Metrics from "./Metrics";

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"][0];
  metrics?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

const SVG_COMMANDS: Record<Command["command"], string> = {
  moveTo: "M",
  lineTo: "L",
  quadraticCurveTo: "Q",
  bezierCurveTo: "C",
  closePath: "Z",
};

export default function Svg({
  glyph,
  font,
  metrics = true,
  fill = false,
  width = 50,
  height = 50,
}: Props) {
  const ratio = Math.min(width, height);
  let scaleX = (1 / font.unitsPerEm) * ratio;
  let scaleY = (1 / font.unitsPerEm) * ratio;

  if (metrics) {
    console.log(glyph.advanceWidth, glyph.bbox.width);
  }
  const x = -font.bbox.minX * scaleX;
  const y = font.ascent * scaleY;

  const commands = glyph.path.commands.map((command) => {
    let args = command.args;

    switch (command.command) {
      case "moveTo":
        args = [x + args[0] * scaleX, y + -args[1] * scaleY];
        break;

      case "lineTo":
        args = [x + args[0] * scaleX, y + -args[1] * scaleY];
        break;

      case "quadraticCurveTo":
        args = [
          x + args[0] * scaleX,
          y + -args[1] * scaleY,
          x + args[2] * scaleX,
          y + -args[3] * scaleY,
        ];
        break;

      case "bezierCurveTo":
        args = [
          x + args[0] * scaleX,
          y + -args[1] * scaleY,
          x + args[2] * scaleX,
          y + -args[3] * scaleY,
          x + args[4] * scaleX,
          y + -args[5] * scaleY,
        ];
        break;
    }

    return {
      ...command,
      args: args.map((arg) => {
        arg = Math.round(arg * 100) / 100;
        return arg;
      }),
    };
  });

  const d = commands
    .map(
      (command) => `${SVG_COMMANDS[command.command]}${command.args.join(" ")} `
    )
    .join(" ");

  const dots = commands.reduce(
    (acc, command) => {
      const args = command.args.slice(0);

      switch (command.command) {
        case "bezierCurveTo":
          // acc.push([args[0], args[1], radius, "#94a3b8"]);
          // acc.push([args[2], args[3], radius, "#94a3b8"]);
          acc.push({
            id: command.id,
            points: [args[4], args[5]],
            fill: "#2563eb",
          });
          break;
        case "quadraticCurveTo":
          // acc.push([args[0], args[1], radius, "#94a3b8"]);
          acc.push({
            id: command.id,
            points: [args[2], args[3]],
            fill: "#2563eb",
          });
          break;
        case "lineTo":
        case "moveTo":
          acc.push({
            id: command.id,
            points: [args[0], args[1]],
            fill: "#2563eb",
          });
      }

      return acc;
    },
    [] as {
      id: string;
      points: [number, number];
      fill: string;
    }[]
  );

  const viewBox = `0 0  ${width} ${height}`;

  return (
    <svg width={width} height={height} viewBox={viewBox}>
      {metrics && (
        <>
          <Metrics
            font={font}
            x={x}
            y={y}
            scaleX={scaleX}
            scaleY={scaleY}
            advanceWidth={glyph.advanceWidth}
          />
        </>
      )}
      <path
        fill={fill ? "black" : "none"}
        stroke="black"
        strokeWidth={fill ? 0 : 2}
        d={d}
      />

      {metrics &&
        dots.map((dot, index) => (
          <circle
            cx={dot.points[0]}
            fill={dot.fill}
            cy={dot.points[1]}
            r={15}
            key={index}
            className="cursor-pointer"
            onClick={() => {
              console.log("clicked");
            }}
          />
        ))}
    </svg>
  );
}
