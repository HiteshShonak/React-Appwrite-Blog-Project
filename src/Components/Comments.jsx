import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import appwriteService from '../appwrite/config';
import { Link, useNavigate } from 'react-router-dom';
import { cacheUserProfile } from '../Store/usersSlice';

const CommentItem = memo(({ comment, userData, toggleLike, setDeleteCommentId, postAuthorId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cachedAuthor = useSelector((state) => 
        state.users && comment.userId ? state.users.profiles[comment.userId] : null
    );

    const [authorAvatarUrl, setAuthorAvatarUrl] = useState(cachedAuthor?.avatar || null);
    const [authorUsername, setAuthorUsername] = useState(cachedAuthor?.username || null);
    
    const isTemp = comment.$id.startsWith('temp-');
    const isPostAuthor = postAuthorId && comment.userId === postAuthorId;
    const isOwnComment = userData && userData.$id === comment.userId;
    
    const isLiked = useMemo(() => 
        comment.likedBy && userData && comment.likedBy.includes(userData.$id),
        [comment.likedBy, userData]
    );
    const likeCount = useMemo(() => comment.likedBy ? comment.likedBy.length : 0, [comment.likedBy]);
    
    const formattedDate = useMemo(() => {
        if (isTemp) return 'Posting...';
        
        const date = new Date(comment.$createdAt);
        const now = new Date();
        const isCurrentYear = date.getFullYear() === now.getFullYear();

        return date.toLocaleDateString(undefined, { 
            year: isCurrentYear ? undefined : 'numeric',
            month: 'short', 
            day: 'numeric' 
        });
    }, [comment.$createdAt, isTemp]);

    useEffect(() => {
        if (isTemp || cachedAuthor) {
            if (cachedAuthor) {
                setAuthorUsername(cachedAuthor.username);
                setAuthorAvatarUrl(cachedAuthor.avatar);
            }
            return;
        }

        if (!comment.userId) return;

        let isCancelled = false;

        appwriteService.getUserProfile(comment.userId)
            .then((profile) => {
                if (profile && !isCancelled) {
                    const username = profile.Username;
                    const avatarUrl = profile.ProfileImageFileId 
                        ? appwriteService.getAvatarPreview(profile.ProfileImageFileId) 
                        : null;

                    setAuthorUsername(username);
                    setAuthorAvatarUrl(avatarUrl);
                    
                    dispatch(cacheUserProfile({
                        userId: comment.userId,
                        profileData: { username, avatar: avatarUrl }
                    }));
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    console.error('Error fetching comment author profile:', error);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [comment.userId, isTemp, cachedAuthor, dispatch]);

    const getInitials = useCallback((name) => name ? name.charAt(0).toUpperCase() : '?', []);
    const handleDelete = useCallback(() => setDeleteCommentId(comment.$id), [comment.$id, setDeleteCommentId]);
    const handleLike = useCallback(() => {
        if (!userData) {
            navigate("/login");
            return;
        }
        toggleLike(comment);
    }, [userData, comment, toggleLike, navigate]);

    return (
        <div className={`flex gap-3 pt-3 first:pt-0 group ${isTemp ? 'opacity-70' : 'opacity-100'}`}>
            
            <Link 
                to={authorUsername ? `/author/${authorUsername}` : '#'} 
                className="interactive gpu-accelerate shrink-0 w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 hover:ring-2 hover:ring-indigo-50 transition-all shadow-sm overflow-hidden mt-1"
            >
                {authorAvatarUrl ? (
                    <img 
                        src={authorAvatarUrl} 
                        alt={comment.authorName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    getInitials(comment.authorName)
                )}
            </Link>

            <div className="flex-1 min-w-0">
                <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 relative group/bubble">
                    
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                                to={authorUsername ? `/author/${authorUsername}` : '#'} 
                                className="interactive font-bold text-slate-900 text-sm hover:text-indigo-600 hover:underline transition-colors"
                            >
                                {authorUsername ? `@${authorUsername}` : comment.authorName}
                            </Link>
                            
                            {isPostAuthor && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    Author
                                </span>
                            )}

                            <span className="text-xs text-slate-400 font-medium">
                                • {formattedDate}
                            </span>
                        </div>

                        {isOwnComment && !isTemp && (
                            <button 
                                onClick={handleDelete} 
                                className="text-slate-300 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-all duration-200 opacity-100 lg:opacity-0 lg:group-hover/bubble:opacity-100"
                                aria-label="Delete comment"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button 
                        onClick={handleLike}
                        disabled={isTemp}
                        className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {isLiked ? 'Liked' : 'Like'}
                        {likeCount > 0 && <span className="bg-slate-100 px-1.5 rounded-full text-[10px]">{likeCount}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

function Comments({ postId, postAuthorId }) {
    if (!postId) {
        return (
            <div className="text-center py-6 text-slate-400 text-sm">
                Unable to load comments.
            </div>
        );
    }

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
    
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();
    
    const isMountedRef = useRef(true);

    const cachedUserProfile = useSelector((state) => 
        state.users && userData?.$id ? state.users.profiles[userData.$id] : null
    );

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = deleteCommentId ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [deleteCommentId]);

    useEffect(() => {
        if (!userData) {
            setCurrentUserAvatar(null);
            return;
        }

        if (cachedUserProfile?.avatar) {
            setCurrentUserAvatar(cachedUserProfile.avatar);
            return;
        }

        let isCancelled = false;

        appwriteService.getUserProfile(userData.$id)
            .then((profile) => {
                if (profile?.ProfileImageFileId && !isCancelled) {
                    const avatarUrl = appwriteService.getAvatarPreview(profile.ProfileImageFileId);
                    setCurrentUserAvatar(avatarUrl);

                    dispatch(cacheUserProfile({
                        userId: userData.$id,
                        profileData: { 
                            username: profile.Username,
                            avatar: avatarUrl 
                        }
                    }));
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    console.error('Error fetching current user avatar:', error);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [userData, cachedUserProfile, dispatch]);

    useEffect(() => {
        let isCancelled = false;

        const loadComments = async () => {
            setLoading(true);
            try {
                const data = await appwriteService.getComments(postId);
                if (data?.documents && !isCancelled) {
                    setComments(data.documents);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Error fetching comments:", error);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadComments();

        return () => {
            isCancelled = true;
        };
    }, [postId]);

    const fetchComments = useCallback(async (isSilent = false) => {
        if (!isSilent && isMountedRef.current) setLoading(true);
        try {
            const data = await appwriteService.getComments(postId);
            if (data?.documents && isMountedRef.current) setComments(data.documents);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            if (!isSilent && isMountedRef.current) setLoading(false);
        }
    }, [postId]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const content = newComment.trim();
        if (!content || !userData) return;
        
        if (isMountedRef.current) {
            setSubmitting(true);
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticComment = {
            $id: tempId,
            content: content,
            postId,
            userId: userData.$id,
            authorName: userData.name,
            $createdAt: new Date().toISOString(),
            likedBy: []
        };

        if (isMountedRef.current) {
            setComments((prev) => [optimisticComment, ...prev]);
            setNewComment("");
        }

        try {
            await appwriteService.createComment({
                content: content,
                postId,
                userId: userData.$id,
                authorName: userData.name,
                likedBy: []
            });
            
            if (isMountedRef.current) {
                fetchComments(true);
            }
        } catch (error) {
            console.error("Error posting comment:", error);
            if (isMountedRef.current) {
                setComments((prev) => prev.filter(c => c.$id !== tempId));
                setNewComment(content); 
            }
        } finally {
            if (isMountedRef.current) {
                setSubmitting(false);
            }
        }
    }, [newComment, userData, postId, fetchComments]);

    const confirmDelete = useCallback(async () => {
        if (!deleteCommentId) return;
        const commentToDelete = deleteCommentId;
        setDeleteCommentId(null);
        
        const previousComments = [...comments];
        setComments((prev) => prev.filter(c => c.$id !== commentToDelete));

        try {
            await appwriteService.deleteComment(commentToDelete);
            fetchComments(true);
        } catch (error) {
            console.error("Error deleting comment:", error);
            if (isMountedRef.current) {
                setComments(previousComments); 
            }
        }
    }, [deleteCommentId, comments, fetchComments]);

    const toggleLike = useCallback(async (comment) => {
        if (!userData) return;
        const userId = userData.$id;
        const currentLikes = comment.likedBy || [];
        const updatedLikes = currentLikes.includes(userId) 
            ? currentLikes.filter(id => id !== userId) 
            : [...currentLikes, userId];

        setComments(prev => prev.map(c => c.$id === comment.$id ? { ...c, likedBy: updatedLikes } : c));

        try {
            await appwriteService.updateComment(comment.$id, { likedBy: updatedLikes });
        } catch (error) { 
            console.error("Error toggling like:", error);
            fetchComments(true); 
        }
    }, [userData, fetchComments]);

    const handleCommentChange = useCallback((e) => setNewComment(e.target.value), []);
    const closeModal = useCallback(() => setDeleteCommentId(null), []);

    const renderLoadingSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="relative w-full">
            
            {deleteCommentId && createPortal(
                <div 
                    className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                    onClick={closeModal}
                >
                    <div 
                        className="gpu-accelerate bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-slate-100"
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-5 border border-rose-100">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Comment?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                This will permanently remove your comment.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={closeModal} 
                                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Discussion 
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </h3>

            {userData ? (
                <form onSubmit={handleSubmit} className="mb-8 relative group">
                    <div className="flex gap-3">
                        <div className="shrink-0">
                            {currentUserAvatar ? (
                                <img 
                                    src={currentUserAvatar} 
                                    alt={userData.name} 
                                    className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
                                    {userData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-slate-700 text-sm placeholder:text-slate-400"
                                rows="2"
                                placeholder="What are your thoughts?"
                                value={newComment}
                                onChange={handleCommentChange}
                                disabled={submitting}
                            />
                            <div className="flex justify-end mt-2">
                                <button 
                                    type="submit" 
                                    disabled={submitting || !newComment.trim()} 
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    {submitting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-center mb-8 border border-slate-100">
                    <p className="text-slate-500 text-sm">
                        <Link to="/signup" className="interactive text-indigo-600 font-bold hover:underline">Sign Up</Link> to join the conversation.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {loading ? renderLoadingSkeleton() : comments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Be the first to share your thoughts.</div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem 
                            key={comment.$id} 
                            comment={comment} 
                            userData={userData} 
                            toggleLike={toggleLike} 
                            setDeleteCommentId={setDeleteCommentId}
                            postAuthorId={postAuthorId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Comments;