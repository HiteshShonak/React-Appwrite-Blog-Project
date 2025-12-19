import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import postSlice from './postSlice';
import dashboardSlice from './dashboardSlice';
import homeSlice from './homeSlice';
import usersSlice from './usersSlice';
import ratingSlice from './ratingSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postSlice,
    dashboard: dashboardSlice,
    home: homeSlice,
    users: usersSlice,
    ratings: ratingSlice,
  },
});

export default store;