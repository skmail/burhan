import { ArrowLeftIcon } from "@heroicons/react/solid";
import { useEffect } from "react";

export default function ImageTest() {
  useEffect(() => {
    const image = new Image();

    image.onload = (e) => {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);

      const colors = [];
      const points: Record<string, number> = {};

      for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
          const data = ctx.getImageData(x, y, 1, 1);
          const [r, g, b, a] = Array.from(data.data);
          const rgba = `rgba(${r},${g},${b},${a})`;
          let j = colors.indexOf(rgba);
          if (j === -1) {
            j = colors.length;
            colors.push(rgba);
          }

          points[`${x},${y}`] = j;
        }
      }
      console.log(points, colors);
    };

    //   while (image.data[channel] != null) {
    //     let x = i % image.width;
    //     let y = Math.floor(i / image.width);
    //     let r = image.data[channel++];
    //     let g = image.data[channel++];
    //     let b = image.data[channel++];
    //     let a = image.data[channel++];
    //     let rgba = `rgba(${r},${g},${b},${a})`;

    //     let j = colors.indexOf(rgba);
    //     if (j === -1) {
    //       j = colors.length;
    //       colors.push(rgba);
    //     }

    //     points[`${x},${y}`] = j;

    //     i++;
    //   }
    // };

    image.src = "/font_rend.png";
  }, []);

  return <div>Image</div>;
}
