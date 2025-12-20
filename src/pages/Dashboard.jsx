import React, { useState, useEffect, useCallback, useMemo } from 'react';
import appwriteService from '../appwrite/config.js';
import { Container, PostCard, LogoutBtn } from '../Components'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { setUserPosts, setUserProfile } from '../Store/dashboardSlice'; 
import { setMultipleRatings } from '../Store/ratingSlice';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import ProfilePictureManager from '../Components/ProfilePictureManager';
import BioEditModal from '../Components/BioEditModal';
import { DashboardAuthSkeleton } from '../Components/Skeletons.jsx';


function Dashboard() {
    const posts = useSelector((state) => state.dashboard.userPosts);
    const hasFetched = useSelector((state) => state.dashboard.hasFetched);
    const cachedProfile = useSelector((state) => state.dashboard.userProfile); 
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();

    // ✅ INITIALIZE FROM CACHE
    const [userBio, setUserBio] = useState(cachedProfile.bio || "");
    const [username, setUsername] = useState(cachedProfile.username || "");
    const [loading, setLoading] = useState(!hasFetched || !cachedProfile.username); 
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Memoized computed values
    const { draftPosts, activePosts, postCount } = useMemo(() => ({
        draftPosts: posts.filter((post) => post.Status === 'draft'),
        activePosts: posts.filter((post) => post.Status === 'active'),
        postCount: posts.length
    }), [posts]);

    // Prefetch ratings function
    const prefetchRatings = useCallback(async (postsList) => {
        try {
            const ratingsPromises = postsList.map(post => 
                appwriteService.getPostRatings(post.$id)
                    .then(data => {
                        if (data && data.documents.length > 0) {
                            const total = data.documents.reduce((acc, curr) => acc + curr.stars, 0);
                            const avg = parseFloat((total / data.documents.length).toFixed(1));
                            return { postId: post.$id, rating: avg };
                        }
                        return null;
                    })
                    .catch(() => null)
            );

            const results = await Promise.all(ratingsPromises);
            
            const ratingsMap = {};
            results.forEach(result => {
                if (result) {
                    ratingsMap[result.postId] = result.rating;
                }
            });

            dispatch(setMultipleRatings(ratingsMap));
        } catch (error) {
            console.error("Error prefetching ratings:", error);
        }
    }, [dispatch]);

    const fetchData = useCallback(() => {
    if (authStatus && userData) {
        
        // ✅ SMART LOADING: Check if profile is cached
        const isStaleData = posts.length > 0 && posts[0]?.UserId !== userData.$id;
        const needsProfile = !cachedProfile.username;
        const shouldShowLoader = (!hasFetched && posts.length === 0) || isStaleData || needsProfile;

        if (shouldShowLoader) {
            setLoading(true); 
        }

        // ✅ SMART FETCH: Only fetch profile if NOT cached
        const promises = [];
        
        // We fetch profile to check updates, but we prioritize cache for display
        promises.push(appwriteService.getUserProfile(userData.$id));
        
        promises.push(
            appwriteService.getPosts([
                Query.equal("UserId", userData.$id), 
                Query.orderDesc("$createdAt")
            ])
        );

        Promise.all(promises)
            .then(async (results) => {
                const profileRes = results[0];
                const postsRes = results[1];
                
                // ✅ Update profile and STORE IMAGE ID
                if (profileRes) {
                    const fetchedBio = profileRes?.Bio || "";
                    const fetchedUsername = profileRes?.Username || "";
                    const fetchedImageId = profileRes?.ProfileImageFileId || null; // 🚨 Capture Image ID
                    
                    setUserBio(fetchedBio);
                    setUsername(fetchedUsername);

                    dispatch(setUserProfile({
                        username: fetchedUsername,
                        bio: fetchedBio,
                        profileImageId: fetchedImageId // 🚨 Save to Redux
                    }));
                }

                // ✅ Always update posts
                if (postsRes) {
                    dispatch(setUserPosts(postsRes.documents));
                    await prefetchRatings(postsRes.documents);
                }
            })
            .catch((error) => {
                console.error("Error fetching dashboard data:", error);
            })
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
}, [authStatus, userData, hasFetched, posts, cachedProfile.username, dispatch, prefetchRatings]);


    useEffect(() => { fetchData(); }, [fetchData]);

    const openBioModal = useCallback(() => setIsBioModalOpen(true), []);
    const closeBioModal = useCallback(() => setIsBioModalOpen(false), []);
    const handleBioSaved = useCallback((newBio) => {
        setUserBio(newBio);
        // ✅ UPDATE CACHE WHEN BIO CHANGES
        // Preserve the existing image ID when updating bio
        dispatch(setUserProfile({ 
            username, 
            bio: newBio, 
            profileImageId: cachedProfile.profileImageId 
        }));
    }, [username, cachedProfile.profileImageId, dispatch]);

    // GUEST VIEW
    if (!authStatus) {
        return (
            <div className='w-full min-h-screen bg-slate-50 py-12 sm:py-20 relative overflow-hidden page-anim px-2 sm:px-4'>
                
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <Container>
                    <div className="flex flex-col items-center justify-center relative z-10">
                        <div className="gpu-accelerate bg-white p-6 sm:p-10 md:p-14 rounded-4xl shadow-2xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
                            
                            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                            <div className="mb-6 sm:mb-8 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm transform rotate-3 hover:rotate-0 transition-all duration-300">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">
                                Dashboard Access
                            </h1>
                            <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
                                Join our community of writers. Log in to manage your stories, track your views, and connect with your audience.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1">
                                        Log In
                                    </button>
                                </Link>
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <button className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                                        Create Account
                                    </button>
                                </Link>
                            </div>

                            <div className="pt-6 sm:pt-8 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">
                                    Everything you need to write
                                </p>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                                    {[
                                        { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Analytics", color: "emerald" },
                                        { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Drafts", color: "blue" },
                                        { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z", label: "Community", color: "purple" }
                                    ].map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2">
                                            <div className={`p-2 bg-${item.color}-50 text-${item.color}-600 rounded-lg`}>
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // SKELETON LOADER
    if (loading) {
        
        return <DashboardAuthSkeleton />;
    }

    // AUTHENTICATED DASHBOARD
    return (
        <div className='w-full min-h-screen bg-slate-50 py-6 sm:py-8 relative page-anim px-2 sm:px-4'>
            
            <BioEditModal 
                isOpen={isBioModalOpen}
                onClose={closeBioModal}
                initialBio={userBio || `Hi! My name is ${userData?.name || 'Writer'}.`}
                userData={userData}
                onBioSaved={handleBioSaved}
            />

            <Container>
                {/* IDENTITY SECTION */}
                <div className="gpu-accelerate bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    
                    <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
                        <div className="shrink-0">
                            {/* 🚨 OPTIMIZATION: Pass the Image ID directly to child */}
                            <ProfilePictureManager 
                                initialFileId={cachedProfile.profileImageId} 
                                onProfileUpdate={fetchData} 
                            />
                        </div>
                        <div className="min-w-0"> 
                            <h1 className='text-lg sm:text-xl font-bold text-slate-900 flex items-baseline gap-1 truncate'>
                                <span>{userData?.name || 'Writer'}</span>
                                {username && (
                                    <span className="text-slate-400 font-normal text-xs sm:text-sm">
                                        @{username}
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                                <span className="line-clamp-1">Welcome Back to your Workspace</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-end">
                        <button 
                            onClick={openBioModal}
                            className="interactive gpu-accelerate flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm font-semibold h-8 sm:h-10 shadow-sm hover:shadow-md"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span>Edit Bio</span>
                        </button>

                        <div className="h-6 sm:h-8 w-px bg-slate-200 mx-0.5 sm:mx-1 hidden md:block"></div>

                        <LogoutBtn className="text-white bg-red-600 hover:bg-red-700 active:bg-red-800" />
                    </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Overview</h2>
                    </div>
                    <Link to="/add-post" className="inline-flex items-center justify-center px-3 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95 hover:-translate-y-0.5 active:translate-y-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="max-[400px]:hidden">Create New Post</span>
                    </Link>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
                    {[
                        { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", label: "Total Posts", value: postCount, color: "blue" },
                        { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Published", value: activePosts.length, color: "emerald" },
                        { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Drafts", value: draftPosts.length, color: "amber", span: "col-span-2 md:col-span-1" }
                    ].map((stat, index) => (
                        <div key={index} className={`gpu-accelerate bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 sm:gap-3 md:gap-4 ${stat.span || ''}`}>
                            <div className={`p-2 sm:p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg sm:rounded-xl shrink-0`}>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} /></svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONTENT SECTIONS */}
                <div className="space-y-8 sm:space-y-12">
                    {/* DRAFTS SECTION */}
                    {draftPosts.length > 0 && (
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Your Drafts
                            </h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
                                {draftPosts.map((post) => (
                                    <div key={post.$id} className="relative group">
                                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded shadow-sm">DRAFT</div>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PUBLISHED SECTION */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Published Articles
                        </h2>
                        {activePosts.length === 0 ? (
                            <div className="gpu-accelerate bg-white rounded-xl p-8 sm:p-12 text-center border-2 border-slate-100 border-dashed flex flex-col items-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-slate-300">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No published stories yet</h3>
                                <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Your published posts will appear here.</p>
                                <Link to="/add-post" className="text-sm sm:text-base text-indigo-600 font-bold hover:underline">
                                    Start writing
                                </Link>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
                                {activePosts.map((post) => (
                                    <PostCard key={post.$id} {...post} />
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