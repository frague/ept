import { createSlice } from '@reduxjs/toolkit'

export const catalogueSlice = createSlice({
  name: 'catalogue',
  initialState: {
    epts: []
  },
  reducers: {
    add: (state, action) => {
      state.epts.push(action.payload)
    },
    remove: (state, action) => {
      state.epts.splice(state.epts.indexOf(action.payload), 1);
    }
  }
})

export const { add, remove } = catalogueSlice.actions;

export default catalogueSlice.reducer;