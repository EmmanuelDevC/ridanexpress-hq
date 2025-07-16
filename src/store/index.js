import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    }),
  devTools: true
});

export default store;