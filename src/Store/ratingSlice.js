import { createSlice } from '@reduxjs/toolkit';

const ratingSlice = createSlice({
    name: 'ratings',
    initialState: {
        postRatings: {},
        
        userRatings: {}
    },
    reducers: {
        setPostRating: (state, action) => {
            const { postId, average, count } = action.payload;
            state.postRatings[postId] = { average, count };
        },
        setMultipleRatings: (state, action) => {
            state.postRatings = { ...state.postRatings, ...action.payload };
        },
        setUserRating: (state, action) => {
            const { postId, stars, ratingId } = action.payload;
            state.userRatings[postId] = { stars, ratingId };
        },
        removeUserRating: (state, action) => {
            delete state.userRatings[action.payload];
        },
        updateRatingOptimistic: (state, action) => {
            const { postId, newUserStars, oldUserStars } = action.payload;
            
            const currentRating = state.postRatings[postId];
            
            if (!currentRating) {
                state.postRatings[postId] = { average: newUserStars, count: 1 };
                return;
            }
            
            const { average, count } = currentRating;
            
            let newAverage, newCount;
            
            if (oldUserStars === 0) {
                newCount = count + 1;
                newAverage = parseFloat(((average * count + newUserStars) / newCount).toFixed(1));
            } else {
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