import { createSlice } from '@reduxjs/toolkit'

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState: {
    epts: []
  },
  reducers: {
    add: (state, action) => {
      state.epts.push(action.payload)
    },
    remove: (state, action) => {
      let index = state.epts.indexOf(action.payload);
      if (index >= 0) state.epts.splice(index, 1);
    }
  }
})

export const { add, remove } = canvasSlice.actions;

export const selectCanvas = state => state.epts;

export default canvasSlice.reducer;
