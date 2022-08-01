import "../styles/globals.css";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { store } from "../store";
import { Provider } from "react-redux";

const queryClient = new QueryClient();
axios.defaults.baseURL = process.env.API_ENDPOINT;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
