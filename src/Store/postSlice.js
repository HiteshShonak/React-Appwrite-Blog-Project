import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: []
}

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        // 1. Load all posts (runs on first visit)
        setPosts: (state, action) => {
            state.posts = action.payload; 
        },
        // 2. Add a single post (runs after Create)
        addPost: (state, action) => {
            state.posts.unshift(action.payload); // Add to TOP of list
        },
        // 3. Update a post (runs after Edit)
        updatePost: (state, action) => {
            state.posts = state.posts.map((post) => 
                post.$id === action.payload.$id ? action.payload : post
            );
        },
        // 4. Remove a post (runs after Delete)
        deletePost: (state, action) => {
            state.posts = state.posts.filter((post) => post.$id !== action.payload);
        }
    }
})

export const { setPosts, addPost, updatePost, deletePost } = postSlice.actions;

export default postSlice.reducer;