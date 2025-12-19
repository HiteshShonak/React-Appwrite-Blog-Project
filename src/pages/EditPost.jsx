import React, { useState, useEffect } from 'react'
import { PostForm, Container } from '../Components'
import appwriteService from '../appwrite/config.js'
import { useParams, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'

function EditPost() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post);
                } else {
                    navigate('/');
                }
            });
        } else {
            navigate('/');
        }
    }, [slug, navigate]);

    // 🚨 DITTO SAME LOADER AS POSTFORM (Immersive Transition)
    if (!post) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
                <div className="relative flex flex-col items-center">
                    <div className="relative flex h-24 w-24 mb-8">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-24 w-24 bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-2xl shadow-indigo-500/40 items-center justify-center border border-indigo-400/20">
                            {/* Bouncing Pencil Icon (Matches PostForm) */}
                            <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </span>
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                            Initializing Editor
                        </h3>
                        <p className="text-indigo-200/80 text-sm font-medium tracking-wide">
                            Preparing your workspace...
                        </p>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className='py-12 bg-slate-50 min-h-screen page-anim px-2 sm:px-4'>
            <Container>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>Edit Article</h1>
                            <p className="text-slate-500 mt-1">Update content, status, or featured image.</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                            Editing Mode
                        </span>
                    </div>
                    
                    {/* Editor Wrapper */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <PostForm post={post} />
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default EditPost