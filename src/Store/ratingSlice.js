import { createSlice } from '@reduxjs/toolkit';

const ratingSlice = createSlice({
    name: 'ratings',
    initialState: {
        // { postId: { average: 4.5, count: 23 } }
        postRatings: {},
        
        // { postId: { stars: 4, ratingId: "abc123" } }
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
            const { postId, stars, ratingId } = action.payload;
            state.userRatings[postId] = { stars, ratingId };
        },
        removeUserRating: (state, action) => {
            delete state.userRatings[action.payload];
        },
        // ✅ NEW: Optimistic update for instant UI feedback
        updateRatingOptimistic: (state, action) => {
            const { postId, newUserStars, oldUserStars } = action.payload;
            
            const currentRating = state.postRatings[postId];
            
            if (!currentRating) {
                // First rating ever for this post
                state.postRatings[postId] = { average: newUserStars, count: 1 };
                return;
            }
            
            const { average, count } = currentRating;
            
            let newAverage, newCount;
            
            if (oldUserStars === 0) {
                // User is adding a NEW rating
                newCount = count + 1;
                newAverage = parseFloat(((average * count + newUserStars) / newCount).toFixed(1));
            } else {
                // User is UPDATING existing rating
                newCount = count;
                newAverage = parseFloat(((average * count - oldUserStars + newUserStars) / count).toFixed(1));
            }
            
            state.postRatings[postId] = { average: newAverage, count: newCount };
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
    updateRatingOptimistic,
    clearRatings 
} = ratingSlice.actions;

export default ratingSlice.reducer;