import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userPosts: [], // Stores Active AND Draft posts for the current user
    hasFetched: false // Track if data has been fetched to prevent unnecessary refetches
}


const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setUserPosts: (state, action) => {
            state.userPosts = action.payload;
            state.hasFetched = true; // Mark as fetched when posts are loaded
        },
        addUserPost: (state, action) => {
            state.userPosts.unshift(action.payload);
        },
        deleteUserPost: (state, action) => {
            state.userPosts = state.userPosts.filter((post) => post.$id !== action.payload);
        },
        updateUserPost: (state, action) => {
            state.userPosts = state.userPosts.map((post) => 
                post.$id === action.payload.$id ? action.payload : post
            );
        },
        resetDashboard: (state) => {
            state.userPosts = [];
            state.hasFetched = false; // Reset fetch flag on logout
        }
    }
})


export const { setUserPosts, addUserPost, deleteUserPost, updateUserPost, resetDashboard } = dashboardSlice.actions;


export default dashboardSlice.reducer;
