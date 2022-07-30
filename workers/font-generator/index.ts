import { Font } from "../../types";
import { OutMessage } from "./types";

type ListenerCallback = (message: OutMessage) => void;
export class FontGeneratorWorker {
  worker: Worker;
  listeners: Partial<Record<OutMessage["type"], Array<ListenerCallback>>> = {};

  constructor() {
    this.worker = new Worker(new URL("./worker", import.meta.url));
  }

  run(font: Font) {
    this.worker.postMessage({
      type: "run",
      font,
    });

    this.worker.addEventListener(
      "message",
      (event: MessageEvent<OutMessage>) => {
        const listeners = this.listeners[event.data.type];
        if (listeners) {
          for (let message of listeners) {
            message(event.data);
          }
        }
      }
    );
  }

  on(type: OutMessage["type"], listener: ListenerCallback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [listener];
    }

    this.listeners[type]?.push(listener);

    return this;
  }

  destroy() {
    this.worker.terminate();
  }
}
