import { useEffect, useRef, useState } from "react";
import { Bounds, Font, Handle, OnCommandUpdate, PointTuple } from "../../types";
import { Stage, Layer, Path, Group } from "react-konva";
import commandsToPath from "../../utils/commandsToPathData";
import Metrics from "./Metrics";
import computePathCommands from "../../utils/computePathCommands";
import Handles from "./Handles";
import { MinusIcon, PlusIcon } from "@heroicons/react/solid";
import PanningArea from "./PanningArea";
import snap from "../../utils/snap";
import Guideline from "./GuideLine";

interface Props {
  font: Omit<Font, "glyphs">;
  glyph: Font["glyphs"]["items"][0];
  onCommandUpdate: OnCommandUpdate;
}
export default function Editor({ font, glyph, onCommandUpdate }: Props) {
  const [bounds, setBounds] = useState<Bounds>({
    width: 0,
    height: 0,
  });

  const [guidelines, setGuidelines] = useState<
    Array<[number, number, number, number]>
  >([]);

  const ref = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.9);

  const [pan, setPan] = useState([0, 0]);

  const updateZoom = (value: number) => {
    setZoom((zoom) => Math.min(10, Math.max(zoom + value, 0.1)));
  };
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
    ref.current.addEventListener("wheel", (e) => {
      updateZoom(e.deltaY * 0.004);
    });

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const width = bounds.width;
  const height = bounds.height;

  const scaleWithoutZoom =
    (1 / (font.ascent - font.descent)) * Math.min(height, width);
  const scale = scaleWithoutZoom * zoom;

  const x = width / 2 + pan[0] - (glyph.bbox.width / 2) * scale;
  const baseline =
    height / 2 + pan[1] + ((font.ascent + font.descent) / 2) * scale;
  const commands = computePathCommands(
    glyph.path.commands.ids.map((id) => glyph.path.commands.items[id]),
    x,
    baseline,
    scale
  );
  const data = commandsToPath(commands);

  const handles = commands.reduce((acc, command) => {
    const args = command.args.slice(0);

    switch (command.command) {
      case "bezierCurveTo":
        acc.push({
          id: command.id,
          points: [args[0], args[1]],
          type: "cubicBezier1",
          indexes: [0, 1],
        });

        acc.push({
          id: command.id,
          points: [args[2], args[3]],
          type: "cubicBezier2",
          indexes: [2, 3],
        });

        acc.push({
          id: command.id,
          points: [args[4], args[5]],
          type: "cubicBezierPoint",
          indexes: [4, 5],
        });

        break;
      case "quadraticCurveTo":
        acc.push({
          id: command.id,
          points: [args[0], args[1]],
          type: "quadraticBezier",
          indexes: [0, 1],
        });
        acc.push({
          id: command.id,
          points: [args[2], args[3]],
          type: "quadraticBezierPoint",
          indexes: [2, 3],
        });
        break;
      case "lineTo":
      case "moveTo":
        acc.push({
          id: command.id,
          points: [args[0], args[1]],
          type: "point",
          indexes: [0, 1],
        });
    }

    return acc;
  }, [] as Handle[]);

  const points = [
    {
      type: "baseline",
      points: [0, 0],
    },
    {
      type: "x",
      points: [0, 0],
    },
    {
      type: "width",
      points: [glyph.advanceWidth, 0],
    },
    {
      type: "ascent",
      points: [0, font.ascent],
    },
    {
      type: "descent",
      points: [0, font.descent],
    },
    {
      type: "xHeight",
      points: [0, font.xHeight],
    },
    {
      type: "capHeight",
      points: [0, font.capHeight],
    },
    ...handles.map((handle) => {
      return {
        ...handle,
        points: [
          (handle.points[0] - x) / scale,
          (baseline - handle.points[1]) / scale,
        ],
      };
    }),
  ];

  const toCanvasPoint = (_x: number, _y: number) => {
    return [x + _x * scale, baseline - _y * scale];
  };

  return (
    <div
      className="bg-gray-100 relative"
      style={{
        width: bounds.width,
        height: bounds.height,
      }}
      ref={ref}
    >
      <div className="absolute bottom-2 right-2 flex flex-col z-50 space-y-2 items-end">
        <div className="text-xs w-full py-1 px-2 bg-black bg-opacity-90 text-white rounded-md">
          {zoom.toFixed(2)}
        </div>
        <button
          onClick={() => updateZoom(0.1)}
          className="bg-white hover:ring hover:ring-gray-300 shadow w-8 h-8 rounded flex items-center justify-center"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => updateZoom(-0.1)}
          className="bg-white hover:ring hover:ring-gray-300 shadow w-8 h-8 rounded flex items-center justify-center"
        >
          <MinusIcon className="w-5 h-5" />
        </button>
      </div>

      <PanningArea
        onPan={(x, y) => {
          setPan((pan) => [pan[0] + x, pan[1] + y]);
        }}
      />
      <Stage width={bounds.width} height={bounds.height}>
        <Layer>
          <Metrics
            width={bounds.width}
            height={bounds.height}
            ascent={font.ascent}
            descent={font.descent}
            xHeight={font.xHeight}
            capHeight={font.capHeight}
            scale={scale}
            baseline={baseline}
            x={x}
            advanceWidth={glyph.advanceWidth}
          />

          {guidelines.map((guideline, index) => {
            console.log(guideline);
            return (
              <Guideline
                key={index}
                points={
                  [
                    ...toCanvasPoint(guideline[0], guideline[1]),
                    ...toCanvasPoint(guideline[2], guideline[3]),
                  ] as [number, number, number, number]
                }
              />
            );
          })}

          <Group opacity={1}>
            <Path data={data} strokeWidth={1} stroke="block" />
            <Handles
              handles={handles}
              onDrag={(handle) => {
                const command = glyph.path.commands.items[handle.id];

                let xy: PointTuple = [
                  command.args[handle.indexes[0]] + handle.points[0] / scale,
                  command.args[handle.indexes[1]] + handle.points[1] / scale,
                ];

                const snapped = snap(
                  {
                    ...handle,
                    points: xy,
                  },
                  points as any,
                  scale
                );

                if (snapped.type !== "none" && snapped.fromPoints) {
                  setGuidelines(
                    snapped.fromPoints.map((p) => [
                      snapped.points[0],
                      snapped.points[1],
                      p[0],
                      p[1],
                    ])
                  );
                } else {
                  setGuidelines((lines) => (lines.length ? [] : lines));
                }

                xy = snapped.points;

                const args = command.args.map((arg, index) => {
                  const cIndex = handle.indexes.indexOf(index);
                  if (cIndex !== -1) {
                    return xy[cIndex];
                  }
                  return arg;
                });

                onCommandUpdate({
                  ...command,
                  args,
                });
              }}
              onDragEnd={() => {
                setGuidelines([]);
              }}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
