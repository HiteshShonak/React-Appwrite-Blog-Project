import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import appwriteService from "../appwrite/config"; 
import { Button, Container } from "../Components";
import parse from "html-react-parser";
import { useSelector, useDispatch } from "react-redux";
import { deletePost, updatePost } from "../Store/postSlice";
import { deleteUserPost, updateUserPost } from "../Store/dashboardSlice";
import { deleteTrendingPost, updateTrendingPost } from "../Store/homeSlice";
import { cacheUserProfile } from "../Store/usersSlice";
import { hasViewedCookie, setViewedCookie } from "../utils/cookieUtils";
import Comments from "../Components/Comments";
import Rating from "../Components/Rating.jsx";
import { PostSkeleton } from "../Components/Skeletons.jsx";

// ✅ Helper to update dashboard cache (Remove item)
const removePostFromDashboardCache = (postId) => {
    try {
        const cacheKey = 'dashboard_user_posts';
        const cachedData = localStorage.getItem(cacheKey);
        
        if (!cachedData) return;

        const posts = JSON.parse(cachedData);
        const updatedPosts = posts.filter(p => p.$id !== postId);

        localStorage.setItem(cacheKey, JSON.stringify(updatedPosts));
        console.log('✅ Dashboard cache updated (delete) - No API fetch required.');
    } catch (error) {
        console.error("Manual cache update failed:", error);
    }
};

export default function Post() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const userData = useSelector((state) => state.auth.userData);

    const cachedPost = useSelector((state) => {
        const fromAllPosts = state.posts.posts.find((p) => p.$id === slug);
        if (fromAllPosts) return fromAllPosts;
        
        const fromTrending = state.home.trendingPosts.find((p) => p.$id === slug);
        if (fromTrending) return fromTrending;
        
        return state.dashboard.userPosts.find((p) => p.$id === slug) || null;
    });

    const [post, setPost] = useState(cachedPost);
    const [loading, setLoading] = useState(!cachedPost);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [authorAvatarUrl, setAuthorAvatarUrl] = useState(null); 
    const [authorUsername, setAuthorUsername] = useState(null);
    
    const isMountedRef = useRef(true); 
    const viewIncrementedRef = useRef(false);
    const hasFetchedRef = useRef(false);

    const authorId = post?.UserId;
    const postId = post?.$id;
    const postAuthorId = post?.UserId;

    const cachedAuthor = useSelector((state) => 
        state.users && authorId ? state.users.profiles[authorId] : null
    );

    const { authorName, authorInitials, isAuthor, formattedDate } = useMemo(() => {
        const name = post?.AuthorName || 'Guest Author';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';
        const author = post && userData ? post.UserId === userData.$id : false;
        const date = post?.$createdAt 
            ? new Date(post.$createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })
            : 'N/A';
        
        return { authorName: name, authorInitials: initials, isAuthor: author, formattedDate: date };
    }, [post, userData]);

    useEffect(() => {
        window.scrollTo(0, 0);
        isMountedRef.current = true;
        viewIncrementedRef.current = false;
        hasFetchedRef.current = false;
        
        return () => {
            isMountedRef.current = false;
        };
    }, [slug]);

    useEffect(() => {
        document.body.style.overflow = isDeleteModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isDeleteModalOpen]);

    useEffect(() => {
        if (!authorId) return;

        if (cachedAuthor) {
            setAuthorUsername(cachedAuthor.username);
            setAuthorAvatarUrl(cachedAuthor.avatar);
            return;
        }

        let isCancelled = false;

        appwriteService.getUserProfile(authorId)
            .then((profile) => {
                if (isCancelled || !isMountedRef.current || !profile) return;

                const avatar = profile.ProfileImageFileId 
                    ? appwriteService.getAvatarPreview(profile.ProfileImageFileId) 
                    : null;
                const username = profile.Username;

                setAuthorUsername(username);
                setAuthorAvatarUrl(avatar);

                dispatch(cacheUserProfile({
                    userId: authorId,
                    profileData: { username, avatar }
                }));
            })
            .catch((err) => {
                if (!isCancelled) {
                    console.error("Author fetch error:", err);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [authorId, cachedAuthor, dispatch]);

    useEffect(() => {
        if (hasFetchedRef.current) return;

        const handleViewIncrement = async (currentPost) => {
    if (currentPost.Views !== undefined && !viewIncrementedRef.current && !hasViewedCookie(currentPost.$id)) {
        viewIncrementedRef.current = true;
        setViewedCookie(currentPost.$id);
        
        try {
            // ✅ Your incrementViews returns FULL post
            const updatedPost = await appwriteService.incrementViews(currentPost.$id, currentPost.Views);
            
            if (updatedPost && isMountedRef.current) {
                // ✅ Use full updatedPost everywhere
                setPost(updatedPost);
                dispatch(updatePost(updatedPost));
                dispatch(updateUserPost(updatedPost));
                dispatch(updateTrendingPost(updatedPost));
            }
        } catch (error) {
            console.error("View increment failed:", error);
        }
    }
};



        const loadPost = async () => {
            if (cachedPost) {
                setPost(cachedPost);
                setLoading(false);
                handleViewIncrement(cachedPost);
                hasFetchedRef.current = true;
                return;
            }

            setLoading(true);
            try {
                const fetchedPost = await appwriteService.getPost(slug);
                
                if (!isMountedRef.current) return;

                if (fetchedPost) {
                    setPost(fetchedPost);
                    handleViewIncrement(fetchedPost);
                } else {
                    navigate("/");
                }
            } catch (error) {
                console.error("Post fetch error:", error);
                if (isMountedRef.current) navigate("/");
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
                hasFetchedRef.current = true;
            }
        };

        loadPost();
    }, [slug, cachedPost, navigate]);

    const handleDeleteClick = useCallback(() => setIsDeleteModalOpen(true), []);

    const confirmDelete = useCallback(async () => {
        if (!post) return;
        
        try {
            const featuredImageId = post.featuredImage; 
            const status = await appwriteService.deletePost(post.$id);
            
            if (status) {
                await appwriteService.deleteFile(featuredImageId);
                
                // 1. Update Redux (Memory)
                dispatch(deletePost(post.$id));
                dispatch(deleteUserPost(post.$id));
                dispatch(deleteTrendingPost(post.$id));
                
                // 2. Update LocalStorage (Disk)
                // This ensures that when you land on Dashboard, the post is already gone.
                removePostFromDashboardCache(post.$id);

                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    }, [post, dispatch, navigate]);

    if (loading) return <PostSkeleton />;

    return post ? (
        <div className="py-8 sm:py-12 bg-slate-50 min-h-screen relative page-anim px-2 sm:px-4">
            
            {isDeleteModalOpen && createPortal(
                <div 
                    className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div 
                        className="gpu-accelerate bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 border border-slate-100"
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 border border-rose-100 shadow-inner">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Delete Article?</h3>
                            <p className="text-slate-500 mb-6 sm:mb-8 leading-relaxed text-sm">
                                This action is permanent. This story and all its comments will be deleted forever.
                            </p>

                            <div className="flex gap-2 sm:gap-3 w-full">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <Container>
                <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    
                    <div className="relative w-full aspect-video group overflow-hidden">
                        <img 
                            src={appwriteService.getFileView(post.featuredImage)} 
                            alt={post.Title} 
                            className="w-full h-full object-cover" 
                        />
                        
                        {isAuthor && (
                            <div className="absolute top-2 sm:top-6 right-2 sm:right-6 flex gap-1.5 sm:gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button 
                                        bgcolor="bg-emerald-500" 
                                        textColor="text-white"
                                        defaultClassesActive={false}
                                        className="shadow-lg hover:bg-emerald-600 active:bg-emerald-700 transition-all w-14 h-7 sm:w-auto sm:h-auto sm:px-6 sm:py-2 text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 backdrop-blur-sm rounded-lg flex items-center justify-center"
                                    >
                                        Edit
                                    </Button>
                                </Link>
                                <Button 
                                    bgcolor="bg-rose-500" 
                                    textColor="text-white"
                                    defaultClassesActive={false}
                                    onClick={handleDeleteClick} 
                                    className="shadow-lg hover:bg-rose-600 active:bg-rose-700 transition-all w-14 h-7 sm:w-auto sm:h-auto sm:px-6 sm:py-2 text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 backdrop-blur-sm rounded-lg flex items-center justify-center"
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 sm:p-8 md:p-12 pb-8 sm:pb-10">
                        <div className="mb-6 sm:mb-8 border-b border-slate-200 pb-4 sm:pb-6">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-3 sm:mb-4">
                                {post.Title}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-slate-500 text-sm font-medium">
                                <Link 
                                    to={authorUsername ? `/author/${authorUsername}` : '#'} 
                                    className="gpu-accelerate interactive flex items-center gap-2 sm:gap-3 text-slate-700 group hover:opacity-80 transition-opacity"
                                >
                                    {authorAvatarUrl ? (
                                        <img 
                                            src={authorAvatarUrl} 
                                            alt={authorName} 
                                            className="gpu-accelerate w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all" 
                                        />
                                    ) : (
                                        <div className="gpu-accelerate w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                            {authorInitials}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {authorName}
                                            {authorUsername && (
                                                <span className="text-slate-400 font-normal text-xs sm:text-sm ml-1.5">
                                                    @{authorUsername}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Published on {formattedDate}
                                        </span>
                                    </div>
                                </Link>
                                <span className="font-semibold flex items-center gap-1 text-indigo-600 text-sm sm:text-base">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    {post.Views !== undefined ? post.Views : '...'} Views
                                </span>
                            </div>
                        </div>
                        <div className="browser-css text-base sm:text-lg text-slate-700 leading-relaxed space-y-3 sm:space-y-4">
                            {parse(post.Content || "")}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 mx-6 sm:px-8 md:mx-12 mb-8 sm:mb-10"></div>

                    <div className="px-6 sm:px-8 md:px-12 pb-8 sm:pb-12">
                        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
                            <section>
                                <Rating postId={postId} postAuthorId={postAuthorId} />
                            </section>
                            
                            <div className="border-t border-slate-100"></div>

                            <section>
                                <Comments postId={postId} postAuthorId={postAuthorId}/>
                            </section>
                        </div>
                    </div>

                </article>
            </Container>
        </div>
    ) : null;
}