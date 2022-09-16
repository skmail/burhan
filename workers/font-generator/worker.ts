import toOpentype from "../../utils/toOpentype";
import { InMessage } from "./types";

addEventListener("message", (event: MessageEvent<InMessage>) => {
  if (event.data.type === "run") {
    const url = toOpentype(event.data.font);
    postMessage({
      type: "done",
      url,
    });
  }
});

export {};
