import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import font from "./font";
import workspace from "./workspace";

export const store = configureStore({
  reducer: {
    font: font.reducer,

    workspace: workspace.reducer,
  },
  middleware: [],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
