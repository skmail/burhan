import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, Fragment, useState, useMemo } from "react";
import Button from "../components/Button";
import { saveFont } from "../db/database";
import normalizeFont from "../utils/normalizeFont";
import { Popover, Transition } from "@headlessui/react";
import validator from "validator";

export default function Home() {
  const fontLoader = useMutation(
    async ({
      file,
      sample,
      url,
    }: {
      file?: File;
      sample?: string;
      url?: string;
    }) => {
      const fd = new FormData();
      if (file) {
        fd.append("file", file);
      } else if (sample) {
        fd.append("sample", sample);
      } else if (url) {
        fd.append("url", url);
      }
      const response = await axios.post("/font", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*/*",
        },
      });
      saveFont(normalizeFont(response.data));
      return response.data;
    },
    {
      networkMode: "always",
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (!fontLoader.isSuccess) {
      return;
    }
    router.push("/app/" + fontLoader.data.id);
  }, [fontLoader.isSuccess, fontLoader.data]);

  const samples = [
    ["0", "Font sample 1", "English"],
    ["1", "Font sample 2", "English"],
    ["2", "Font sample 4", "Arabic"],
    ["3", "Font sample 5", "Japanese"],
    ["4", "Font sample 3", "Latin"],
  ];

  const [fontUrl, setFontUrl] = useState("");

  const isGoodURL = useMemo(
    () => validator.isURL(fontUrl, { require_protocol: true }),
    [fontUrl]
  );

  return (
    <>
      <h1 className="lg:fixed static  left-1/2 lg:transform lg:-translate-x-1/2 bg-bg-1 px-4 py-2 pt -8 mx-auto w-fit text-6xl font-bold">
        Burhan Fonts
      </h1>
      <div className="lg:h-screen grid lg:grid-cols-2 w-full max-w-sm lg:max-w-full mx-auto">
        <div className="flex flex-col items-center p-4 justify-center gap-4  lg:border-r py-16">
          <button
            disabled={fontLoader.isLoading}
            className="border-2 border-dashed border-gray-300  max-w-sm w-full rounded-lg p-8 hover:border-gray-200/90 relative overflow-hidden cursor-pointer flex items-center justify-center flex-col"
          >
            <input
              disabled={fontLoader.isLoading}
              onChange={(e) => {
                if (!e.target.files?.length) {
                  return;
                }

                fontLoader.mutate({
                  file: e.target.files[0],
                });
                e.target.value = "";
              }}
              className="opacity-0 inset-0 absolute"
              type="file"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-4 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M9 13v-1h6v1" />
              <path d="M12 12v6" />
              <path d="M11 18h2" />
            </svg>
            <span className="font-bold">Click here or drop your font file</span>
            <p className="text-gray-600">Supported files woff, ttf</p>
          </button>
          <div className="h-px bg-gray-200 w-full max-w-sm flex items-center justify-center my-8">
            <div className="bg-white px-4">Or</div>
          </div>
          <div className="relative max-w-sm w-full">
            <input
              onChange={(e) => {
                setFontUrl(e.target.value);
              }}
              placeholder="https://examples.com/font.woff2"
              className="w-full ring h-10 ring-gray-300 rounded px-2 focus:outline-none focus:ring-blue-500"
            />
            <button
              onClick={() => {
                fontLoader.mutate({
                  url: fontUrl,
                });
              }}
              disabled={!isGoodURL || fontLoader.isLoading}
              className="absolute bg-input-bg px-2 enabled:hover:bg-blue-600 enabled:bg-blue-500 enabled:text-white top-1 right-1 h-8 rounded"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex flex-col relative gap-4 p-4 lg:p-16 items-center justify-center bg-1">
          <div
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dad9db' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            className="absolute inset-0 -z-50"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white" />
            <div className="absolute inset-0 bg-gradient-to-t from-white" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-4 w-full">
            {samples.map((sample) => (
              <button
                className="border rounded-lg p-4 bg-white bg-1  text-start hover:bg-gray-50 shadow-sm"
                disabled={fontLoader.isLoading}
                key={sample[1]}
                onClick={() =>
                  fontLoader.mutate({
                    sample: sample[0],
                  })
                }
              >
                <div className="text-gray-700">{sample[1]}</div>
                <div className="text-gray-400 text-sm">{sample[2]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {fontLoader.isLoading && (
        <div className="flex fixed bg-gray-900/40 backdrop-blur-sm text-white space-y-4 inset-0 flex-col space-2 items-center justify-center ">
          <div className="animate-spin w-8 h-8 bg-gray-200" />
          <h1>Fetching font metadata and glyphs </h1>
        </div>
      )}

      {!fontLoader.isLoading && fontLoader.isError && (
        <div className="bg-gray-900 text-white rounded  px-4 py-2 fixed bottom-4 left-4">
          {
            // @ts-ignore
            fontLoader.error.response.data.message
          }
        </div>
      )}
    </>
  );
}
