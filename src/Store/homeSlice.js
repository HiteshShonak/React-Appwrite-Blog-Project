import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    trendingPosts: [] 
}

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {
        setTrendingPosts: (state, action) => {
            state.trendingPosts = action.payload; 
        },
        // 🚨 1. Handle Edit: Update the specific post in the trending list
        updateTrendingPost: (state, action) => {
            state.trendingPosts = state.trendingPosts.map((post) => 
                post.$id === action.payload.$id ? { ...post, ...action.payload } : post
            );
        },
        // 🚨 2. Handle Delete: Remove the post from the trending list
        deleteTrendingPost: (state, action) => {
            state.trendingPosts = state.trendingPosts.filter((post) => post.$id !== action.payload);
        }
    }
})

// Export the new actions
export const { setTrendingPosts, updateTrendingPost, deleteTrendingPost } = homeSlice.actions;

export default homeSlice.reducer;