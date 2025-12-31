import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: []
}

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload; 
        },
        addPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        updatePost: (state, action) => {
            state.posts = state.posts.map((post) => 
                post.$id === action.payload.$id ? action.payload : post
            );
        },
        deletePost: (state, action) => {
            state.posts = state.posts.filter((post) => post.$id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                (action) => action.type === 'dashboard/updateUserPost',
                (state, action) => {
                    const updatedPost = action.payload;
                    const postId = updatedPost.$id;
                    const existsInAllPosts = state.posts.some(post => post.$id === postId);
                    
                    if (updatedPost.Status === 'draft' && existsInAllPosts) {
                        state.posts = state.posts.filter((post) => post.$id !== postId);
                    }
                    
                    else if (updatedPost.Status === 'active' && existsInAllPosts) {
                        state.posts = state.posts.map((post) => 
                            post.$id === postId ? updatedPost : post
                        );
                    }
                }
            )
            .addMatcher(
                (action) => action.type === 'dashboard/deleteUserPost',
                (state, action) => {
                    state.posts = state.posts.filter((post) => post.$id !== action.payload);
                }
            );
    }
})

export const { setPosts, addPost, updatePost, deletePost } = postSlice.actions;

export default postSlice.reducer;