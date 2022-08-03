import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import workspace from "./workspace";

export const store = configureStore({
  reducer: {},
  middleware: [],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
