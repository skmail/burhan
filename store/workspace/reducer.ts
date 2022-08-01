import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

interface State {
  ready: boolean;
  keyboard: Record<string, boolean>;
}
const initialState: State = {
  ready: false,
  keyboard: {},
};

const slice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setReady(state) {
      state.ready = true;
    },
    setKeyboardKeys(state, action: PayloadAction<{ [key: string]: boolean }>) {
      state.keyboard = {
        ...state.keyboard,
        ...action.payload,
      };
    },
    resetKeyboardKeys(state) {
      state.keyboard = {};
    },
  },
});

export const { setReady, setKeyboardKeys, resetKeyboardKeys } = slice.actions;

export const selectWorkspace = (state: RootState): State => state.workspace;
export const selectKeyboard = (state: RootState) => state.workspace.keyboard;

export default slice.reducer;
