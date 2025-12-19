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
    // 🏆 BEST APPROACH: Simple + Reliable
    extraReducers: (builder) => {
        builder
            .addMatcher(
                (action) => action.type === 'dashboard/updateUserPost',
                (state, action) => {
                    const updatedPost = action.payload;
                    const postId = updatedPost.$id;
                    const existsInAllPosts = state.posts.some(post => post.$id === postId);
                    
                    // ✅ Active → Draft: REMOVE from AllPosts
                    if (updatedPost.Status === 'draft' && existsInAllPosts) {
                        state.posts = state.posts.filter((post) => post.$id !== postId);
                    }
                    // ✅ Active → Active: UPDATE in AllPosts
                    else if (updatedPost.Status === 'active' && existsInAllPosts) {
                        state.posts = state.posts.map((post) => 
                            post.$id === postId ? updatedPost : post
                        );
                    }
                    // ✅ Draft → Active: DO NOTHING (let backend handle on next visit)
                    // User will see it when they refresh or navigate to AllPosts
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