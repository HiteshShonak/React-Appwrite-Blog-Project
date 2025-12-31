import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profiles: {}
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        cacheUserProfile: (state, action) => {
            const { userId, profileData } = action.payload;
            state.profiles[userId] = profileData;
        }
    }
})

export const { cacheUserProfile } = usersSlice.actions;

export default usersSlice.reducer;