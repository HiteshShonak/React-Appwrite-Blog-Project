import React, { useState, useEffect, useCallback } from 'react';
import appwriteService from '../appwrite/config.js';
import { Container, PostCard, LogoutBtn } from '../Components'; 
// 🚨 1. Import Redux Hooks & Action
import { useSelector, useDispatch } from 'react-redux'; 
import { setUserPosts } from '../Store/dashboardSlice';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import ProfilePictureManager from '../Components/ProfilePictureManager';
import BioEditModal from '../Components/BioEditModal';

function Dashboard() {
    // 🚨 2. Use Redux for Posts (Replaces local useState)
    const posts = useSelector((state) => state.dashboard.userPosts);
    const dispatch = useDispatch();

    const [userBio, setUserBio] = useState("");
    // Only show loading if we have NO posts in Redux
    const [loading, setLoading] = useState(posts.length === 0);
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);

    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);

    const fetchData = useCallback(() => {
        if (authStatus && userData) {
            
            // 🚨 3. Smart Fetching Logic
            const promises = [];
            
            // Always fetch Profile (Bio is local state)
            const profilePromise = appwriteService.getUserProfile(userData.$id);
            promises.push(profilePromise);

            // Only fetch Posts if Redux is empty (Cache check)
            if (posts.length === 0) {
                setLoading(true); 
                const postsPromise = appwriteService.getPosts([
                    Query.equal("UserId", userData.$id), 
                    Query.orderDesc("$createdAt")
                ]);
                promises.push(postsPromise);
            }

            Promise.all(promises)
                .then((results) => {
                    // Handle Profile Result (Always index 0)
                    const profileRes = results[0];
                    if (profileRes && profileRes.Bio) {
                        setUserBio(profileRes.Bio);
                    } else {
                        setUserBio("");
                    }

                    // Handle Posts Result (Index 1, only if fetched)
                    const postsRes = results[1]; 
                    if (postsRes) {
                        // 🚨 4. Save to Redux Store
                        dispatch(setUserPosts(postsRes.documents));
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [authStatus, userData, posts.length, dispatch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openBioModal = () => setIsBioModalOpen(true);
    const handleBioSaved = (newBio) => setUserBio(newBio);

    // =================================================================
    // 1. GUEST VIEW (Exact Same Styling)
    // =================================================================
    if (!authStatus) {
        return (
            <div className='w-full min-h-screen bg-slate-50 py-20 relative overflow-hidden page-anim'>
                
                {/* Decorative Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <Container>
                    <div className="flex flex-col items-center justify-center relative z-10">
                        <div className="bg-white p-10 md:p-14 rounded-4xl shadow-2xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
                            
                            {/* Gradient Top Border */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                            {/* Icon */}
                            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm transform rotate-3 hover:rotate-0 transition-all duration-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>

                            {/* Text */}
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                Dashboard Access
                            </h1>
                            <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                Join our community of writers. Log in to manage your stories, track your views, and connect with your audience.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="w-full px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1">
                                            Log In
                                    </button>
                                </Link>
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <button className="w-full px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                                            Create Account
                                    </button>
                                </Link>
                            </div>

                            {/* Features Footer (Social Proof) */}
                            <div className="pt-8 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                    Everything you need to write
                                </p>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">Analytics</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">Drafts</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">Community</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </Container>
            </div>
        );
    }
    // =================================================================
    // 2. SKELETON LOADER (Exact Same Styling)
    // =================================================================
    if (loading) {
        return (
            <div className='w-full min-h-screen bg-slate-50 py-8 animate-pulse'>
                <Container>
                    {/* Identity Skeleton */}
                    <div className="bg-white rounded-2xl p-6 mb-8 flex items-center gap-4 border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-6 w-48 bg-slate-200 rounded"></div>
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        </div>
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-24">
                                <div className="h-8 w-8 bg-slate-200 rounded-lg mb-2"></div>
                                <div className="h-4 w-16 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Content Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-slate-200 rounded-xl h-64 w-full"></div>
                        ))}
                    </div>
                </Container>
            </div>
        );
    }

    // =================================================================
    // 3. AUTHENTICATED DASHBOARD (Exact Same Styling)
    // =================================================================
    const draftPosts = posts.filter((post) => post.Status === 'draft');
    const activePosts = posts.filter((post) => post.Status === 'active');

    return (
        <div className='w-full min-h-screen bg-slate-50 py-8 relative page-anim'>
            
            <BioEditModal 
                isOpen={isBioModalOpen}
                onClose={() => setIsBioModalOpen(false)}
                initialBio={userBio || `Hi! My name is ${userData?.name || 'Writer'}.`}
                userData={userData}
                onBioSaved={handleBioSaved}
            />

            <Container>
                {/* IDENTITY SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* LEFT: Avatar & Name */}
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="shrink-0">
                            <ProfilePictureManager onProfileUpdate={fetchData} />
                        </div>
                        <div className="min-w-0"> 
                            <h1 className='text-xl font-bold text-slate-900 truncate'>
                                {userData?.name || 'Writer'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5 font-medium">
                                
                                    <span className="line-clamp-1">Welcome Back to your Workspace</span>
                                
                            </p>
                        </div>
                    </div>
                    
                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                        <button 
                            onClick={openBioModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit Bio
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

                        <LogoutBtn className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-all" />
                    </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
                    </div>
                    <Link to="/add-post" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create New Post
                    </Link>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Posts</p>
                            <h3 className="text-2xl font-bold text-slate-800">{posts.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Published</p>
                            <h3 className="text-2xl font-bold text-slate-800">{activePosts.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Drafts</p>
                            <h3 className="text-2xl font-bold text-slate-800">{draftPosts.length}</h3>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTIONS */}
                <div className="space-y-12">
                    {/* DRAFTS SECTION */}
                    {draftPosts.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Your Drafts
                            </h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {draftPosts.map((post) => (
                                    <div key={post.$id} className="relative group">
                                        <div className="absolute top-3 left-3 z-10 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded shadow-sm">DRAFT</div>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PUBLISHED SECTION */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Published Articles
                        </h2>
                        {activePosts.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border-2 border-slate-100 border-dashed flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">No published stories yet</h3>
                                <p className="text-slate-500 mb-6">Your published posts will appear here.</p>
                                <Link to="/add-post" className="text-indigo-600 font-bold hover:underline">
                                    Start writing
                                </Link>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {activePosts.map((post) => (
                                    <div key={post.$id}>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Dashboard;