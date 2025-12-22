import { createSlice } from '@reduxjs/toolkit';

const ratingSlice = createSlice({
    name: 'ratings',
    initialState: {
        // { postId: { average: 4.5, count: 23 } }
        postRatings: {},
        
        // { postId: { rating: 4, ratingId: "abc123" } }
        userRatings: {}
    },
    reducers: {
        setPostRating: (state, action) => {
            const { postId, average, count } = action.payload;
            state.postRatings[postId] = { average, count };
        },
        setMultipleRatings: (state, action) => {
            // { postId1: { average: 4.5, count: 10 }, postId2: { average: 3.2, count: 5 } }
            state.postRatings = { ...state.postRatings, ...action.payload };
        },
        setUserRating: (state, action) => {
            const { postId, rating, ratingId } = action.payload;
            state.userRatings[postId] = { rating, ratingId };
        },
        removeUserRating: (state, action) => {
            delete state.userRatings[action.payload];
        },
        clearRatings: (state) => {
            state.postRatings = {};
            state.userRatings = {};
        }
    }
});

export const { 
    setPostRating, 
    setMultipleRatings, 
    setUserRating, 
    removeUserRating, 
    clearRatings 
} = ratingSlice.actions;

export default ratingSlice.reducer;