import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userPosts: [], 
    hasFetched: false, 
    userProfile: { 
        username: "",
        bio: "",
        profileImageId: null 
    }
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setUserPosts: (state, action) => {
            state.userPosts = action.payload;
            state.hasFetched = true; 
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

        setUserProfile: (state, action) => {
            state.userProfile = {
                username: action.payload.username || state.userProfile.username,
                bio: action.payload.bio || state.userProfile.bio,
                profileImageId: action.payload.profileImageId !== undefined ? action.payload.profileImageId : state.userProfile.profileImageId
            };
        },
        resetDashboard: (state) => {
            state.userPosts = [];
            state.hasFetched = false; 
            state.userProfile = { username: "", bio: "", profileImageId: null };
        }
    },

    extraReducers: (builder) => {
        builder
            .addMatcher(
                (action) => action.type === 'posts/updatePost',
                (state, action) => {
                    state.userPosts = state.userPosts.map((post) => 
                        post.$id === action.payload.$id ? action.payload : post
                    );
                }
            )
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