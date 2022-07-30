import { Font } from "../../types";

type RunMessage = {
  type: "run";
  font: Font;
};

type DoneMessage = {
  type: "done";
  url: string;
};
type DoneMessage2 = {
  type: "we";
  data: string
};

export type InMessage = RunMessage;
export type OutMessage = DoneMessage | DoneMessage2;
