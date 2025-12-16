import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import appwriteService from '../appwrite/config';

function Rating({ postId }) {
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [ratingId, setRatingId] = useState(null);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    
    // 🚨 NEW: State for Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const userData = useSelector((state) => state.auth.userData);

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

    useEffect(() => {
        fetchRatings();
    }, [postId, userData]);

    const averageRating = ratings.length 
        ? (ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length).toFixed(1) 
        : "0.0";

    const handleRate = async (stars) => {
        if (!userData || submitting) return;
        setSubmitting(true);
        
        const prevRating = userRating;
        setUserRating(stars);

        try {
            await appwriteService.setRating({ postId, userId: userData.$id, stars });
            fetchRatings();
        } catch (error) {
            console.error("Rating failed:", error);
            setUserRating(prevRating);
        } finally {
            setSubmitting(false);
        }
    };

    // 🚨 1. Trigger the Modal
    const promptDelete = () => {
        if (!ratingId || submitting) return;
        setIsDeleteModalOpen(true);
    };

    // 🚨 2. Actual Delete Action
    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await appwriteService.deleteRating(ratingId);
            setUserRating(0);
            setRatingId(null);
            fetchRatings();
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setSubmitting(false);
            setIsDeleteModalOpen(false);
        }
    };

    // 🚨 3. Cancel Action
    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md relative">
            
            {/* ------------------------------------------------------- */}
            {/* 🚨 REMOVE RATING MODAL                                  */}
            {/* ------------------------------------------------------- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 transform transition-all scale-100 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-5 border border-rose-100">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Rating?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Are you sure you want to remove your rating? This will affect the post's average score.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT: Stats & Title */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-20">
                    <span className="text-3xl font-black text-slate-800 leading-none">
                        {averageRating}
                    </span>
                    <div className="flex items-center gap-0.5 mt-1">
                        <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Avg</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {userRating > 0 ? "You rated this article" : "Rate this article"}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {ratings.length} {ratings.length === 1 ? 'vote' : 'votes'} so far
                    </p>
                </div>
            </div>

            {/* RIGHT: Interaction */}
            <div className="flex flex-col items-center md:items-end gap-2">
                
                {/* Star Buttons */}
                <div className="flex items-center gap-1 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-inner">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            disabled={!userData || submitting}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="transition-transform hover:scale-125 focus:outline-none disabled:cursor-not-allowed"
                            title={userData ? `Rate ${star} stars` : "Login to rate"}
                        >
                            <svg 
                                className={`w-8 h-8 transition-colors duration-200 ${
                                    star <= (hover || userRating) 
                                        ? 'text-yellow-400 fill-current drop-shadow-sm' 
                                        : 'text-slate-200 fill-current'
                                }`}
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Status / Delete Action */}
                <div className="h-5 flex items-center justify-end w-full px-2">
                    {!userData ? (
                        <span className="text-xs text-slate-400 font-medium">Log in to vote</span>
                    ) : userRating > 0 ? (
                        <button 
                            // 🚨 Changed to promptDelete
                            onClick={promptDelete}
                            disabled={submitting}
                            className="text-xs text-rose-400 hover:text-rose-600 font-semibold hover:underline flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Remove rating
                        </button>
                    ) : (
                        <span className="text-xs text-indigo-400 font-medium opacity-0 animate-fadeIn">Tap a star</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Rating;