import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config"; 
import { Button, Container } from "../Components";
import parse from "html-react-parser";
// 🚨 REDUX IMPORTS
import { useSelector, useDispatch } from "react-redux";
import { deletePost } from "../Store/postSlice";
import { deleteUserPost } from "../Store/dashboardSlice";
import { deleteTrendingPost } from "../Store/homeSlice";
// 🚨 NEW IMPORT: User Cache Action
import { cacheUserProfile } from "../Store/usersSlice";

import { hasViewedCookie, setViewedCookie } from "../utils/cookieUtils";
import Comments from "../Components/Comments";
import Rating from "../Components/Rating.jsx";

export default function Post() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const userData = useSelector((state) => state.auth.userData);

    // 1. POST CACHING STRATEGY
    const allPosts = useSelector((state) => state.posts.posts);
    const trendingPosts = useSelector((state) => state.home.trendingPosts);
    const userPosts = useSelector((state) => state.dashboard.userPosts);

    const cachedPost = 
        allPosts.find((p) => p.$id === slug) || 
        trendingPosts.find((p) => p.$id === slug) || 
        userPosts.find((p) => p.$id === slug);

    const [post, setPost] = useState(cachedPost || null);
    const [loading, setLoading] = useState(!cachedPost);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 🚨 2. USER CACHING STRATEGY (Instant Avatar/Name)
    // Check if we already have this author in our Redux "Phonebook"
    const authorId = post?.UserId;
    // We safely check if state.users exists to avoid crashes if slice isn't set up yet
    const cachedAuthor = useSelector((state) => 
        state.users && authorId ? state.users.profiles[authorId] : null
    );

    // Initialize with Cached Data if available
    const [authorAvatarUrl, setAuthorAvatarUrl] = useState(cachedAuthor?.avatar || null); 
    const [authorUsername, setAuthorUsername] = useState(cachedAuthor?.username || null);

    const authorName = post?.AuthorName || 'Guest Author';
    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';
    const isAuthor = post && userData ? post.UserId === userData.$id : false; 

    // 🚨 3. SEPARATE EFFECT FOR AUTHOR DATA
    // This runs independently to handle caching logic cleanly 
    useEffect(() => {
        if (post && post.UserId) {
            if (cachedAuthor) {
                // If in Redux, use it (Instant)
                setAuthorUsername(cachedAuthor.username);
                setAuthorAvatarUrl(cachedAuthor.avatar);
            } else {
                // If not, fetch from API and save to Redux
                appwriteService.getUserProfile(post.UserId)
                    .then((profile) => {
                        if (profile) {
                            const avatar = profile.ProfileImageFileId 
                                ? appwriteService.getAvatarPreview(profile.ProfileImageFileId) 
                                : null;
                            const username = profile.Username;

                            setAuthorUsername(username);
                            setAuthorAvatarUrl(avatar);

                            // Save to store for next time
                            dispatch(cacheUserProfile({
                                userId: post.UserId,
                                profileData: { username, avatar }
                            }));
                        }
                    })
                    .catch(() => {});
            }
        }
    }, [post, cachedAuthor, dispatch]);

    // 4. MAIN POST DATA FETCH (Views, Updates)
    useEffect(() => {
        const fetchPostData = async () => {
            if (!post) setLoading(true);
            
            try {
                // Fetch fresh post data (Stale-while-revalidate)
                const currentPost = await appwriteService.getPost(slug);
                
                if (currentPost) {
                    setPost(currentPost); 
                    setLoading(false); 

                    // 🚨 Note: Author Fetching removed from here (handled by effect above)

                    // Increment Views logic
                    const postId = currentPost.$id;
                    if (currentPost.Views !== undefined && !hasViewedCookie(postId)) {
                        appwriteService.incrementViews(postId, currentPost.Views).then((updatedPost) => {
                            if (updatedPost) {
                                setViewedCookie(postId); 
                                setPost(prev => ({ ...prev, Views: updatedPost.Views }));
                            }
                        });
                    }
                } else { navigate("/"); }
            } catch (error) { navigate("/"); }
        };
        
        if (slug) fetchPostData(); else navigate("/");
        
    }, [slug, navigate]);

    // 1. Open Modal Handler
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    // 2. Confirm Delete Logic
    const confirmDelete = async () => {
        const featuredImageId = post.featuredImage; 
        const status = await appwriteService.deletePost(post.$id);
        if (status) {
            await appwriteService.deleteFile(featuredImageId);
            
            dispatch(deletePost(post.$id));
            dispatch(deleteUserPost(post.$id));
            dispatch(deleteTrendingPost(post.$id));
            
            navigate("/dashboard");
        }
    };

    if (loading) {
        return (
            <div className="py-12 bg-slate-50 min-h-screen animate-pulse">
                <Container>
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                        <div className="w-full h-64 md:h-96 bg-slate-200"></div>
                        <div className="p-8 md:p-12">
                            <div className="h-10 bg-slate-200 rounded-lg w-3/4 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return post ? (
        <div className="py-12 bg-slate-50 min-h-screen relative page-anim">
            
            {/* 3. DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-slate-100 transform scale-100 transition-all">
                        <div className="flex flex-col items-center text-center">
                            {/* Danger Icon */}
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Article?</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                                This action is permanent. This story and all its comments will be deleted forever.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Container>
                {/* UNIFIED CARD CONTAINER */}
                <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
                    
                    {/* 1. HERO IMAGE */}
                    <div className="relative w-full h-64 md:h-96 group">
                        <img src={appwriteService.getFileView(post.featuredImage)} alt={post.Title} className="w-full h-full object-cover" />
                        
                        {/* Author Actions (Floating) */}
                        {isAuthor && (
                            <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button bgcolor="bg-emerald-500" className="shadow-lg hover:bg-emerald-600 transition-all px-6 py-2 opacity-90 hover:opacity-100 backdrop-blur-sm">Edit</Button>
                                </Link>
                                <Button 
                                    bgcolor="bg-rose-500" 
                                    onClick={handleDeleteClick} 
                                    className="shadow-lg hover:bg-rose-600 transition-all px-6 py-2 opacity-90 hover:opacity-100 backdrop-blur-sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* 2. CONTENT */}
                    <div className="p-8 md:p-12 pb-10">
                        <div className="mb-8 border-b border-slate-200 pb-6">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{post.Title}</h1>
                            <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
                                {/* 🚨 UPDATED LINK: Uses username if available, else '#' */}
                                <Link 
                                    to={authorUsername ? `/author/${authorUsername}` : '#'} 
                                    className="flex items-center gap-3 text-slate-700 group hover:opacity-80 transition-opacity"
                                >
                                    {authorAvatarUrl ? <img src={authorAvatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all" /> 
                                    : <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">{authorInitials}</div>}
                                    
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {authorName}
                                            {/* 🚨 ADDED USERNAME HERE - Styled Lightly */}
                                            {authorUsername && <span className="text-slate-400 font-normal text-sm ml-1.5">@{authorUsername}</span>}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">Published on {post.$createdAt ? new Date(post.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                </Link>
                                <span className="font-semibold flex items-center gap-1 text-indigo-600 text-base">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    {post.Views !== undefined ? post.Views : '...'} Views
                                </span>
                            </div>
                        </div>
                        <div className="browser-css text-lg text-slate-700 leading-relaxed space-y-4">
                            {parse(post.Content || "")}
                        </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className="border-t-4 border-slate-50 mx-8 md:mx-12 mb-10"></div>

                    {/* 3. INTERACTION SECTION */}
                    <div className="px-8 md:px-12 pb-12">
                        <div className="max-w-3xl mx-auto space-y-10">
                            <section>
                                <Rating postId={post.$id} />
                            </section>
                            
                            <div className="border-t border-slate-100"></div>

                            <section>
                                <Comments postId={post.$id} postAuthorId={post.UserId}/>
                            </section>
                        </div>
                    </div>

                </article>
            </Container>
        </div>
    ) : null;
}