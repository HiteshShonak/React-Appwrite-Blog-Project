import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profiles: {} // Structure: { "userId1": { username: "...", avatar: "..." }, "userId2": ... }
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        cacheUserProfile: (state, action) => {
            const { userId, profileData } = action.payload;
            // Add or Update the specific user in the object
            state.profiles[userId] = profileData;
        }
    }
})

export const { cacheUserProfile } = usersSlice.actions;

export default usersSlice.reducer;