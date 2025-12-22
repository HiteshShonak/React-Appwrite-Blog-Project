import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import appwriteService from '../appwrite/config';
import { setMultipleRatings, setUserRating, removeUserRating, updateRatingOptimistic } from '../Store/ratingSlice';
import { Link } from 'react-router-dom';

const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    return parseFloat((total / ratings.length).toFixed(1));
};

function Rating({ postId, postAuthorId }) {
    if (!postId) {
        return (
            <div className="text-center py-6 text-slate-400 text-sm">
                Unable to load ratings.
            </div>
        );
    }

    const [ratings, setRatings] = useState([]);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const userData = useSelector((state) => state.auth.userData);
    const cachedRating = useSelector((state) => state.ratings.postRatings[postId]);
    const cachedUserRating = useSelector((state) => state.ratings.userRatings[postId]);
    const dispatch = useDispatch();

    const userRating = cachedUserRating?.stars || 0;
    const ratingId = cachedUserRating?.ratingId || null;

    const isAuthor = useMemo(() => 
        userData && postAuthorId && userData.$id === postAuthorId,
        [userData, postAuthorId]
    );

    useEffect(() => {
        let isCancelled = false;
        
        const loadRatings = async () => {
            try {
                const data = await appwriteService.getPostRatings(postId);
                if (data?.documents && !isCancelled) {
                    setRatings(data.documents);
                    
                    const avgRating = calculateAverageRating(data.documents);
                    dispatch(setMultipleRatings({ 
                        [postId]: { 
                            average: avgRating, 
                            count: data.documents.length 
                        } 
                    }));

                    if (userData) {
                        const myRating = data.documents.find(r => r.userId === userData.$id);
                        if (myRating) {
                            dispatch(setUserRating({
                                postId,
                                stars: myRating.stars,
                                ratingId: myRating.$id
                            }));
                        }
                    }
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Error fetching ratings:", error);
                }
            }
        };
        
        loadRatings();
        
        return () => {
            isCancelled = true;
        };
    }, [postId, dispatch, userData]);

    useEffect(() => {
        document.body.style.overflow = isDeleteModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isDeleteModalOpen]);

    const averageRating = cachedRating?.average || calculateAverageRating(ratings);
    const voteCount = cachedRating?.count || ratings.length;

    const handleRate = useCallback(async (stars) => {
        if (!userData || submitting || isAuthor) return;
        setSubmitting(true);

        const oldUserStars = userRating;
        
        dispatch(updateRatingOptimistic({
            postId,
            newUserStars: stars,
            oldUserStars: oldUserStars
        }));

        dispatch(setUserRating({
            postId,
            stars: stars,
            ratingId: ratingId || 'temp'
        }));

        try {
            await appwriteService.setRating({ postId, userId: userData.$id, stars });
            
            const freshData = await appwriteService.getPostRatings(postId);
            if (freshData?.documents) {
                setRatings(freshData.documents);
                
                const newAverage = calculateAverageRating(freshData.documents);
                dispatch(setMultipleRatings({ 
                    [postId]: { 
                        average: newAverage, 
                        count: freshData.documents.length 
                    } 
                }));
                
                const myRating = freshData.documents.find(r => r.userId === userData.$id);
                if (myRating) {
                    dispatch(setUserRating({
                        postId,
                        stars: myRating.stars,
                        ratingId: myRating.$id
                    }));
                }
            }
        } catch (error) {
            console.error("Rating failed:", error);
            
            try {
                const freshData = await appwriteService.getPostRatings(postId);
                if (freshData?.documents) {
                    setRatings(freshData.documents);
                    
                    const newAverage = calculateAverageRating(freshData.documents);
                    dispatch(setMultipleRatings({ 
                        [postId]: { 
                            average: newAverage, 
                            count: freshData.documents.length 
                        } 
                    }));

                    const myRating = freshData.documents.find(r => r.userId === userData.$id);
                    if (myRating) {
                        dispatch(setUserRating({
                            postId,
                            stars: myRating.stars,
                            ratingId: myRating.$id
                        }));
                    } else {
                        dispatch(removeUserRating(postId));
                    }
                }
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        } finally {
            setSubmitting(false);
        }
    }, [userData, submitting, isAuthor, userRating, ratingId, postId, dispatch]);

    const confirmDelete = useCallback(async () => {
        if (!ratingId || ratingId === 'temp') return;
        
        setSubmitting(true);
        setIsDeleteModalOpen(false);

        const oldStars = userRating;
        const currentRating = cachedRating;
        
        if (currentRating && currentRating.count > 1) {
            const newCount = currentRating.count - 1;
            const newAverage = parseFloat(((currentRating.average * currentRating.count - oldStars) / newCount).toFixed(1));
            dispatch(setMultipleRatings({
                [postId]: { average: newAverage, count: newCount }
            }));
        } else {
            dispatch(setMultipleRatings({
                [postId]: { average: 0, count: 0 }
            }));
        }

        dispatch(removeUserRating(postId));

        try {
            await appwriteService.deleteRating(ratingId);
            
            const freshData = await appwriteService.getPostRatings(postId);
            if (freshData?.documents) {
                setRatings(freshData.documents);
                
                const newAverage = calculateAverageRating(freshData.documents);
                dispatch(setMultipleRatings({ 
                    [postId]: { 
                        average: newAverage, 
                        count: freshData.documents.length 
                    } 
                }));
            }
        } catch (error) {
            console.error("Delete failed:", error);
            
            try {
                const freshData = await appwriteService.getPostRatings(postId);
                if (freshData?.documents) {
                    setRatings(freshData.documents);
                    
                    const newAverage = calculateAverageRating(freshData.documents);
                    dispatch(setMultipleRatings({ 
                        [postId]: { 
                            average: newAverage, 
                            count: freshData.documents.length 
                        } 
                    }));

                    const myRating = freshData.documents.find(r => r.userId === userData.$id);
                    if (myRating) {
                        dispatch(setUserRating({
                            postId,
                            stars: myRating.stars,
                            ratingId: myRating.$id
                        }));
                    }
                }
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        } finally {
            setSubmitting(false);
        }
    }, [userRating, ratingId, postId, dispatch, cachedRating, userData]);

    return (
        <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-3 min-w-20 shadow-sm">
                        <span className="text-3xl font-black text-slate-800 leading-none">
                            {averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5 mt-1">
                            <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {isAuthor ? "Your Post's Rating" : (userRating > 0 ? "Thanks for rating!" : "Rate this story")}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {voteCount} {voteCount === 1 ? 'vote' : 'votes'} so far
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                    {isAuthor ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <div className="flex items-center gap-1 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm opacity-60 cursor-not-allowed">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg 
                                            key={star}
                                            className="w-8 h-8 text-slate-300 fill-current" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    AUTHOR
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium text-center">
                                You can't rate your own post
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="gpu-accelerate flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        disabled={!userData || submitting}
                                        onClick={() => handleRate(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="interactive gpu-accelerate transition-transform hover:scale-125 focus:outline-none disabled:cursor-not-allowed"
                                        title={userData ? `Rate ${star} stars` : "Login to rate"}
                                    >
                                        <svg className={`w-8 h-8 transition-colors duration-200 ${star <= (hover || userRating) ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-slate-200 fill-current'}`} viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <div className="h-5 flex items-center justify-end w-full px-2">
                                {!userData ? (
                                    <span className="text-xs text-slate-400 font-medium">
                                        Enjoying this story? <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign up</Link> to vote
                                    </span>
                                ) : userRating > 0 ? (
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(true)} 
                                        disabled={submitting} 
                                        className="text-xs text-rose-400 hover:text-rose-600 font-semibold hover:underline flex items-center gap-1 transition-colors"
                                    >
                                        Remove rating
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium animate-fadeIn">
                                        Enjoying this story? <span className="text-indigo-600 font-bold">Give it stars</span>
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isDeleteModalOpen && createPortal(
                <div 
                    className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div 
                        className="gpu-accelerate bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Rating?</h3>
                        <p className="text-sm text-slate-500 mb-6">This will affect the post's average score.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="flex-1 px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="flex-1 px-4 py-2 bg-rose-500 rounded-xl font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default Rating;
