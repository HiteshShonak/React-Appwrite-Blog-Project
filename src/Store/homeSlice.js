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
        updateTrendingPost: (state, action) => {
            state.trendingPosts = state.trendingPosts.map((post) => 
                post.$id === action.payload.$id ? { ...post, ...action.payload } : post
            );
        },
        deleteTrendingPost: (state, action) => {
            state.trendingPosts = state.trendingPosts.filter((post) => post.$id !== action.payload);
        }
    }
})

export const { setTrendingPosts, updateTrendingPost, deleteTrendingPost } = homeSlice.actions;

export default homeSlice.reducer;