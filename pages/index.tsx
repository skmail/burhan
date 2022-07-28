import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Button from "../components/Button";
import { saveFont } from "../db/database";
import normalizeFont from "../utils/normalizeFont";

export default function Home() {
  const fontUploader = useMutation(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const response = await axios.post("https://fonts-api.cssgears.com/", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });
    saveFont(normalizeFont(response.data));
    return response.data;
  });

  const sampleLoader = useMutation(async (id: string) => {
    const response = await axios.get("http://localhost:8080/", {
      params: {
        font: id,
      },
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });

    saveFont(normalizeFont(response.data));

    return response.data;
  });

  const router = useRouter();

  useEffect(() => {
    if (!fontUploader.isSuccess) {
      return;
    }
    router.push("/app/" + fontUploader.data.id);
  }, [fontUploader.isSuccess, fontUploader.data]);

  useEffect(() => {
    if (!sampleLoader.isSuccess) {
      return;
    }
    router.push("/app/" + sampleLoader.data.id);
  }, [sampleLoader.isSuccess, sampleLoader.data]);
  return (
    <div className="h-screen flex flex-col  items-center justify-center ">
      <div className="flex   items-center justify-center ">
        <button className=" px-4 py-2  rounded bg-zinc-800 text-white enabled:hover:ring enabled:hover:ring-gray-300 shadow disabled:opacity-50 relative">
          <input
            onChange={(e) => {
              if (!e.target.files?.length) {
                return;
              }

              fontUploader.mutate(e.target.files[0]);
              e.target.value = "";
            }}
            className="opacity-0 inset-0 absolute"
            type="file"
          />
          Upload font file
        </button>
      </div>

      <div className="flex space-x-2 items-center justify-center mt-6 flex-wrap">
        <Button onClick={() => sampleLoader.mutate("5")} variant="secondary">
          Font sample 1 [EN]
        </Button>
        <Button onClick={() => sampleLoader.mutate("1")} variant="secondary">
          Font sample 2 [EN]
        </Button>
        <Button onClick={() => sampleLoader.mutate("2")} variant="secondary">
          Font sample 3 [LATINE]
        </Button>
        <Button onClick={() => sampleLoader.mutate("3")} variant="secondary">
          Font sample 4 [AR]
        </Button>
        <Button onClick={() => sampleLoader.mutate("4")} variant="secondary">
          Font sample 5 [CH]
        </Button>
      </div>

      {(sampleLoader.isLoading || fontUploader.isLoading) && (
        <div className="flex flex-col space-2 items-center justify-center mt-6">
          <div className="animate-spin w-8 h-8 bg-gray-200" />
          <h1>Font is loading</h1>
        </div>
      )}

      {!sampleLoader.isLoading &&
        !fontUploader.isLoading &&
        fontUploader.isError && (
          <div className="text-red-500 text-xl mt-6">
            {
              // @ts-ignore
              fontUploader.error.response.data.message
            }
          </div>
        )}
      {/* <Button variant="secondary">Use sample file</Button> */}
    </div>
  );
}
