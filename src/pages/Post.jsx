import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config"; 
import { Button, Container } from "../Components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { hasViewedCookie, setViewedCookie } from "../utils/cookieUtils";
import Comments from "../Components/Comments";
import Rating from "../Components/Rating.jsx";

export default function Post() {
    const [post, setPost] = useState(null);
    const [authorAvatarUrl, setAuthorAvatarUrl] = useState(null); 
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const authorName = post?.AuthorName || 'Guest Author';
    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';

    const isAuthor = post && userData ? post.UserId === userData.$id : false; 

    // --- EFFECT: Load Post, Fetch Avatar, and Increment Unique Views ---
    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((currentPost) => {
                if (currentPost) {
                    setPost(currentPost);
                    
                    if (currentPost.UserId) {
                        appwriteService.getProfileImageFileId(currentPost.UserId)
                            .then((fileId) => {
                                if (fileId) {
                                    const url = appwriteService.getAvatarPreview(fileId);
                                    setAuthorAvatarUrl(url);
                                } else {
                                    setAuthorAvatarUrl(null);
                                }
                            })
                            .catch(() => setAuthorAvatarUrl(null));
                    }

                    const postId = currentPost.$id;

                    if (currentPost.Views !== undefined && !hasViewedCookie(postId)) {
                        const currentViews = currentPost.Views;
                        appwriteService.incrementViews(postId, currentViews).then((updatedPost) => {
                            if (updatedPost) {
                                setViewedCookie(postId); 
                                setPost(prevPost => ({
                                    ...prevPost,
                                    Views: updatedPost.Views,
                                }));
                            }
                        });
                    }
                } else {
                    navigate("/");
                }
            });
        } else {
            navigate("/");
        }
    }, [slug, navigate]);

    const deletePost = () => {
        const featuredImageId = post.featuredImage; 
        
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(featuredImageId);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-12 bg-slate-50 min-h-screen">
            <Container>
                <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    
                    {/* Header Image Section */}
                    <div className="relative w-full h-64 md:h-96">
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.Title}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Author Actions */}
                        {isAuthor && (
                            <div className="absolute top-6 right-6 flex gap-3">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button bgcolor="bg-emerald-500" className="shadow-lg hover:bg-emerald-600 transition-all px-6 py-2 opacity-90 hover:opacity-100 backdrop-blur-sm">
                                        Edit
                                    </Button>
                                </Link>
                                <Button bgcolor="bg-rose-500" onClick={deletePost} className="shadow-lg hover:bg-rose-600 transition-all px-6 py-2 opacity-90 hover:opacity-100 backdrop-blur-sm">
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Article Content Wrapper */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8 border-b border-slate-200 pb-6">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                                {post.Title}
                            </h1>
                            <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
                                
                                {/* AUTHOR PROFILE DISPLAY */}
                                <Link 
                                    to={`/author/${post.UserId}`} 
                                    className="flex items-center gap-3 text-slate-700 group hover:opacity-80 transition-opacity"
                                >
                                    {/* Avatar Image or Initials */}
                                    {authorAvatarUrl ? (
                                        <img 
                                            src={authorAvatarUrl} 
                                            alt={authorName} 
                                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                            {authorInitials}
                                        </div>
                                    )}

                                    <div className="flex flex-col">
                                        <span className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {authorName}
                                        </span>
                                        {/* 🚨 UPDATED DATE FORMAT HERE */}
                                        <span className="text-xs text-slate-400 font-medium">
                                            Published on {post.$createdAt ? new Date(post.$createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </span>
                                    </div>
                                </Link>
                                
                                {/* DISPLAY VIEWS COUNT */}
                                <span className="font-semibold flex items-center gap-1 text-indigo-600 text-base">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    {post.Views !== undefined ? post.Views : 'N/A'} Views
                                </span>
                            </div>
                        </div>

                        {/* Rich Text Content */}
                        <div className="browser-css text-lg text-slate-700 leading-relaxed space-y-4">
                            {parse(post.Content || "")}
                        </div>

                        {/* 🚨 RATING SECTION */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <Rating postId={post.$id} />
                        </div>

                        {/* 🚨 COMMENTS SECTION */}
                        <div className="mt-8">
                            <Comments postId={post.$id} />
                        </div>
                    </div>

                </article>
            </Container>
        </div>
    ) : null;
}