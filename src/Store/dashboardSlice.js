import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userPosts: [], // Stores Active AND Draft posts for the current user
    hasFetched: false, // Track if data has been fetched to prevent unnecessary refetches
    userProfile: { // Cache username, bio, AND image
        username: "",
        bio: "",
        profileImageId: null // 🚨 ADDED: Stores the Avatar ID
    }
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
        // Cache user profile (username + bio + avatar)
        setUserProfile: (state, action) => {
            state.userProfile = {
                username: action.payload.username || state.userProfile.username, // Fallback to existing if not provided
                bio: action.payload.bio || state.userProfile.bio,
                // 🚨 ADDED: Save the Image ID (or keep existing if not passed)
                profileImageId: action.payload.profileImageId !== undefined ? action.payload.profileImageId : state.userProfile.profileImageId
            };
        },
        resetDashboard: (state) => {
            state.userPosts = [];
            state.hasFetched = false; // Reset fetch flag on logout
            state.userProfile = { username: "", bio: "", profileImageId: null }; // 🚨 Clear image cache
        }
    },
    // ✅ USE STRING PATTERN MATCHING (avoids circular import)
    extraReducers: (builder) => {
        builder
            // Listen to AllPosts' updatePost
            .addMatcher(
                (action) => action.type === 'posts/updatePost',
                (state, action) => {
                    state.userPosts = state.userPosts.map((post) => 
                        post.$id === action.payload.$id ? action.payload : post
                    );
                }
            )
            // Listen to AllPosts' deletePost
            .addMatcher(
                (action) => action.type === 'posts/deletePost',
                (state, action) => {
                    state.userPosts = state.userPosts.filter((post) => post.$id !== action.payload);
                }
            );
    }
})

export const { setUserPosts, addUserPost, deleteUserPost, updateUserPost, setUserProfile, resetDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;