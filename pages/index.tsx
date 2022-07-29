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
    ["0", "Font sample 1 [EN]"],
    ["1", "Font sample 2 [EN]"],
    ["2", "Font sample 4 [AR]"],
    ["3", "Font sample 5 [JP]"],
    ["4", "Font sample 3 [LATINE]"],
  ];

  const [fontUrl, setFontUrl] = useState("");

  const isGoodURL = useMemo(
    () => validator.isURL(fontUrl, { require_protocol: true }),
    [fontUrl]
  );

  return (
    <div className="h-screen flex flex-col  items-center justify-center ">
      <div className="flex  space-x-4 items-center justify-center ">
        <button
          disabled={fontLoader.isLoading}
          className=" px-4 py-2  rounded bg-zinc-800 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50 relative"
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
          Upload font file
        </button>

        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`
                px-4 py-2  rounded bg-zinc-800 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50 relative

`}
              >
                Upload from url
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="p-4 absolute flex flex-col items-end left-1/2 z-10 w-96 bg-white shadow max-w-sm -translate-x-1/2 transform">
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
                    className="px-4 py-2 mt-4  rounded bg-zinc-800 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50 relative"
                  >
                    Load
                  </button>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>

      <div className="flex space-x-2 items-center justify-center mt-6 flex-wrap">
        {samples.map((sample) => (
          <Button
            disabled={fontLoader.isLoading}
            key={sample[1]}
            onClick={() =>
              fontLoader.mutate({
                sample: sample[0],
              })
            }
            variant="secondary"
          >
            {sample[1]}
          </Button>
        ))}
      </div>

      {fontLoader.isLoading && (
        <div className="flex flex-col space-2 items-center justify-center mt-6">
          <div className="animate-spin w-8 h-8 bg-gray-200" />
          <h1>Font is loading</h1>
        </div>
      )}

      {!fontLoader.isLoading && fontLoader.isError && (
        <div className="text-red-500 text-xl mt-6">
          {
            // @ts-ignore
            fontLoader.error.response.data.message
          }
        </div>
      )}
      {/* <Button variant="secondary">Use sample file</Button> */}
    </div>
  );
}
