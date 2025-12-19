import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // ✅ ADD useDispatch
import { createPortal } from 'react-dom';
import appwriteService from '../appwrite/config';
import { setMultipleRatings } from '../Store/ratingSlice'; // ✅ ADD THIS


function Rating({ postId, postAuthorId }) {
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [ratingId, setRatingId] = useState(null);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch(); // ✅ ADD THIS

    // Check if current user is the post author
    const isAuthor = userData && postAuthorId && userData.$id === postAuthorId;

    const fetchRatings = () => {
        appwriteService.getPostRatings(postId).then((data) => {
            if (data) {
                setRatings(data.documents);
                if (userData) {
                    const myRating = data.documents.find(r => r.userId === userData.$id);
                    if (myRating) {
                        setUserRating(myRating.stars);
                        setRatingId(myRating.$id);
                    } else {
                        setUserRating(0);
                        setRatingId(null);
                    }
                }
            }
        });
    };

    // Scroll lock when modal is open
    useEffect(() => {
        if (isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isDeleteModalOpen]);

    useEffect(() => { fetchRatings(); }, [postId, userData]);

    const averageRating = ratings.length 
        ? (ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length).toFixed(1) 
        : "0.0";

    const handleRate = async (stars) => {
        if (!userData || submitting || isAuthor) return;
        setSubmitting(true);
        const previousRatings = [...ratings];
        const previousUserRating = userRating;
        
        // Optimistic update
        setUserRating(stars);
        const existingIndex = ratings.findIndex(r => r.userId === userData.$id);
        let newRatingsList;
        if (existingIndex !== -1) {
            newRatingsList = [...ratings];
            newRatingsList[existingIndex] = { ...newRatingsList[existingIndex], stars: stars };
        } else {
            newRatingsList = [...ratings, { userId: userData.$id, stars: stars, $id: 'temp' }];
        }
        setRatings(newRatingsList);

        try {
            await appwriteService.setRating({ postId, userId: userData.$id, stars });
            
            // ✅ FETCH FRESH DATA AND UPDATE REDUX
            const freshData = await appwriteService.getPostRatings(postId);
            if (freshData && freshData.documents) {
                setRatings(freshData.documents);
                
                // Calculate new average
                const total = freshData.documents.reduce((acc, curr) => acc + curr.stars, 0);
                const newAverage = parseFloat((total / freshData.documents.length).toFixed(1));
                
                // ✅ UPDATE REDUX CACHE (PostCards will auto-update!)
                dispatch(setMultipleRatings({ [postId]: newAverage }));
                
                // Update user's rating state
                const myRating = freshData.documents.find(r => r.userId === userData.$id);
                if (myRating) {
                    setUserRating(myRating.stars);
                    setRatingId(myRating.$id);
                }
            }
        } catch (error) {
            console.error("Rating failed:", error);
            setRatings(previousRatings);
            setUserRating(previousUserRating);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        setIsDeleteModalOpen(false);
        const previousRatings = [...ratings];
        const previousUserRating = userRating;

        setUserRating(0);
        setRatingId(null);
        setRatings(prev => prev.filter(r => r.userId !== userData.$id));

        try {
            await appwriteService.deleteRating(ratingId);
            
            // ✅ FETCH FRESH DATA AND UPDATE REDUX
            const freshData = await appwriteService.getPostRatings(postId);
            if (freshData && freshData.documents) {
                setRatings(freshData.documents);
                
                if (freshData.documents.length > 0) {
                    // Calculate new average
                    const total = freshData.documents.reduce((acc, curr) => acc + curr.stars, 0);
                    const newAverage = parseFloat((total / freshData.documents.length).toFixed(1));
                    
                    // ✅ UPDATE REDUX CACHE
                    dispatch(setMultipleRatings({ [postId]: newAverage }));
                } else {
                    // ✅ No ratings left, set to 0
                    dispatch(setMultipleRatings({ [postId]: 0 }));
                }
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setRatings(previousRatings);
            setUserRating(previousUserRating);
            setRatingId(ratingId);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Main Rating Component */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
                
                {/* LEFT: Stats */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-3 min-w-20 shadow-sm">
                        <span className="text-3xl font-black text-slate-800 leading-none">{averageRating}</span>
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
                            {ratings.length} {ratings.length === 1 ? 'vote' : 'votes'} so far
                        </p>
                    </div>
                </div>

                {/* RIGHT: Interaction */}
                <div className="flex flex-col items-center md:items-end gap-2">
                    {isAuthor ? (
                        // Grayed out stars with author badge
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
                                    <span className="text-xs text-slate-400 font-medium">Log in to vote</span>
                                ) : userRating > 0 ? (
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(true)} 
                                        disabled={submitting} 
                                        className="text-xs text-rose-400 hover:text-rose-600 font-semibold hover:underline flex items-center gap-1 transition-colors"
                                    >
                                        Remove rating
                                    </button>
                                ) : (
                                    <span className="text-xs text-indigo-400 font-medium opacity-0 animate-fadeIn">Tap a star</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal - centered using portal */}
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