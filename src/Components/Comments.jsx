import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import appwriteService from '../appwrite/config';
import { Link } from 'react-router-dom';
import { cacheUserProfile } from '../Store/usersSlice';

// ----------------------------------------------------------------------
// 1. HELPER COMPONENT: Handles individual comment logic
// ----------------------------------------------------------------------
const CommentItem = ({ comment, userData, toggleLike, setDeleteCommentId, postAuthorId }) => {
    const dispatch = useDispatch();

    const cachedAuthor = useSelector((state) => 
        state.users && comment.userId ? state.users.profiles[comment.userId] : null
    );

    const [authorAvatarUrl, setAuthorAvatarUrl] = useState(cachedAuthor?.avatar || null);
    const [authorUsername, setAuthorUsername] = useState(cachedAuthor?.username || null);
    
    const isLiked = comment.likedBy && userData && comment.likedBy.includes(userData.$id);
    const likeCount = comment.likedBy ? comment.likedBy.length : 0;
    const isTemp = comment.$id.startsWith('temp-');
    
    // 🚨 Check if this comment was written by the Post Author
    const isPostAuthor = postAuthorId && comment.userId === postAuthorId;

    useEffect(() => {
        if (!isTemp && !cachedAuthor) {
            appwriteService.getUserProfile(comment.userId)
                .then((profile) => {
                    if (profile) {
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
                .catch(() => {}); 
        } else if (cachedAuthor) {
            setAuthorUsername(cachedAuthor.username);
            setAuthorAvatarUrl(cachedAuthor.avatar);
        }
    }, [comment.userId, isTemp, cachedAuthor, dispatch]);

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className={`flex gap-2 pt-2 first:pt-0 group ${isTemp ? 'opacity-70' : 'opacity-100'}`}>
            
            <Link 
                to={authorUsername ? `/author/${authorUsername}` : '#'} 
                className="shrink-0 w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100 hover:ring-4 hover:ring-indigo-50 transition-all shadow-sm overflow-hidden"
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

            <div className="flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                    <Link 
                        to={authorUsername ? `/author/${authorUsername}` : '#'} 
                        className="font-bold text-slate-800 text-sm hover:text-indigo-600 hover:underline transition-colors"
                    >
                        {comment.authorName}
                    </Link>
                    
                    {/* 🚨 AUTHOR ATTRIBUTION BADGE */}
                    {isPostAuthor && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Author
                        </span>
                    )}

                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400 font-medium">
                        {isTemp ? 'Posting...' : new Date(comment.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                
                <div className="flex items-center gap-2 mt-1 mb-1">
                    {userData && userData.$id === comment.userId && !isTemp && (
                        <button onClick={() => setDeleteCommentId(comment.$id)} className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">Delete</button>
                    )}
                </div>
            </div>

            <div className="shrink-0 self-center pl-2">
                <button 
                    onClick={() => toggleLike(comment)}
                    className={`flex flex-col items-center gap-0.5 transition-all transform active:scale-90 ${isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}
                    disabled={!userData || isTemp}
                >
                    {isLiked ? (
                        <svg className="w-5 h-5 fill-current drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    ) : (
                        <svg className="w-5 h-5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                    )}
                    <span className="text-[10px] font-bold">{likeCount > 0 ? likeCount : ''}</span>
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------------
// 🚨 Accept 'postAuthorId' prop
function Comments({ postId, postAuthorId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const userData = useSelector((state) => state.auth.userData);

    const fetchComments = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const data = await appwriteService.getComments(postId);
            if (data) setComments(data.documents);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !userData) return;
        setSubmitting(true);

        const tempId = `temp-${Date.now()}`;
        const optimisticComment = {
            $id: tempId,
            content: newComment,
            postId,
            userId: userData.$id,
            authorName: userData.name,
            $createdAt: new Date().toISOString(),
            likedBy: []
        };

        setComments((prev) => [optimisticComment, ...prev]);
        setNewComment("");

        try {
            await appwriteService.createComment({
                content: optimisticComment.content,
                postId,
                userId: userData.$id,
                authorName: userData.name,
                likedBy: []
            });
            fetchComments(true); 
        } catch (error) {
            console.error("Error:", error);
            setComments((prev) => prev.filter(c => c.$id !== tempId));
            setNewComment(optimisticComment.content);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCommentId) return;
        setDeleteCommentId(null);
        const previousComments = [...comments];
        setComments((prev) => prev.filter(c => c.$id !== deleteCommentId));

        try {
            await appwriteService.deleteComment(deleteCommentId);
            fetchComments(true);
        } catch (error) {
            setComments(previousComments);
        }
    };

    const toggleLike = async (comment) => {
        if (!userData) return;
        const userId = userData.$id;
        const currentLikes = comment.likedBy || [];
        let updatedLikes = currentLikes.includes(userId) 
            ? currentLikes.filter(id => id !== userId) 
            : [...currentLikes, userId];

        setComments(prev => prev.map(c => c.$id === comment.$id ? { ...c, likedBy: updatedLikes } : c));

        try {
            await appwriteService.updateComment(comment.$id, { likedBy: updatedLikes });
        } catch (error) { fetchComments(true); }
    };

    return (
        <div className="relative w-full">
            
             {/* 🚨 DELETE MODAL (Fixed Centering) */}
            {deleteCommentId && (
                // Added z-[100] to ensure it is always on top
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-5 border border-rose-100">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Comment?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                This will permanently remove your comment.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteCommentId(null)} className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                Discussion 
                <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-full border border-indigo-100 shadow-sm">
                    {comments.length}
                </span>
            </h3>

            {userData ? (
                <form onSubmit={handleSubmit} className="mb-10 relative group">
                    <textarea
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-slate-700 text-sm shadow-sm placeholder:text-slate-400"
                        rows="3"
                        placeholder="What are your thoughts?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    ></textarea>
                    <div className="absolute bottom-3 right-3 opacity-100 transition-opacity">
                        <button type="submit" disabled={submitting || !newComment.trim()} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200">
                            {submitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-2xl p-8 text-center mb-10 border border-slate-200 border-dashed">
                    <p className="text-slate-500 text-sm">
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link> to join the conversation.
                    </p>
                </div>
            )}

            <div className="space-y-3 divide-y divide-slate-200/60">
                {loading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Be the first to share your thoughts.</div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem 
                            key={comment.$id} 
                            comment={comment} 
                            userData={userData} 
                            toggleLike={toggleLike} 
                            setDeleteCommentId={setDeleteCommentId}
                            // 🚨 Pass the Author ID down
                            postAuthorId={postAuthorId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Comments;