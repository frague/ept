import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from '../components/canvas/canvasSlice';
import catalogueReducer from '../components/catalogue/catalogueSlice';

export default configureStore({
  reducer: {
  	canvas: canvasReducer,
  	catalogue: catalogueReducer,
  }
});