import { store } from "./";
import { PropsWithChildren } from "react";

import { Provider as ReduxProvider, ReactReduxContext } from "react-redux";
export default function Provider({ children }: PropsWithChildren) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
