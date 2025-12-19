import { createSlice } from '@reduxjs/toolkit';

const ratingSlice = createSlice({
    name: 'ratings',
    initialState: {
        // { postId: averageRating }
        postRatings: {}
    },
    reducers: {
        setPostRating: (state, action) => {
            const { postId, rating } = action.payload;
            state.postRatings[postId] = rating;
        },
        setMultipleRatings: (state, action) => {
            // { postId1: rating1, postId2: rating2, ... }
            state.postRatings = { ...state.postRatings, ...action.payload };
        },
        clearRatings: (state) => {
            state.postRatings = {};
        }
    }
});

export const { setPostRating, setMultipleRatings, clearRatings } = ratingSlice.actions;
export default ratingSlice.reducer;
