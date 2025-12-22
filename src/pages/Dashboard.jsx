import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// ✅ Dashboard Cache Keys (Kept as per requirements)
const DASHBOARD_CACHE = {
    POSTS: 'dashboard_user_posts',
    PROFILE: 'dashboard_user_profile',
    RATINGS: 'dashboard_post_ratings',
    USER_ID: 'dashboard_cache_user_id',
    TIMESTAMP: 'dashboard_cache_timestamp'
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 Minutes

const isDashboardCacheValid = (userId) => {
    try {
        const cachedUserId = localStorage.getItem(DASHBOARD_CACHE.USER_ID);
        const timestamp = localStorage.getItem(DASHBOARD_CACHE.TIMESTAMP);
        
        if (!cachedUserId || !timestamp || cachedUserId !== userId) {
            return false;
        }

        const cacheAge = Date.now() - parseInt(timestamp, 10);
        return cacheAge < CACHE_DURATION;
    } catch (error) {
        console.error('Error checking dashboard cache validity:', error);
        return false;
    }
};

const getDashboardCache = (userId) => {
    try {
        if (!isDashboardCacheValid(userId)) {
            clearDashboardCache();
            return null;
        }

        const postsData = localStorage.getItem(DASHBOARD_CACHE.POSTS);
        const profileData = localStorage.getItem(DASHBOARD_CACHE.PROFILE);
        const ratingsData = localStorage.getItem(DASHBOARD_CACHE.RATINGS);

        if (!postsData || !profileData) {
            return null;
        }

        return {
            posts: JSON.parse(postsData),
            profile: JSON.parse(profileData),
            ratings: ratingsData ? JSON.parse(ratingsData) : {}
        };
    } catch (error) {
        console.error('Error reading dashboard cache:', error);
        clearDashboardCache();
        return null;
    }
};

const saveDashboardCache = (userId, posts, profile, ratings) => {
    try {
        localStorage.setItem(DASHBOARD_CACHE.POSTS, JSON.stringify(posts));
        localStorage.setItem(DASHBOARD_CACHE.PROFILE, JSON.stringify(profile));
        localStorage.setItem(DASHBOARD_CACHE.RATINGS, JSON.stringify(ratings));
        localStorage.setItem(DASHBOARD_CACHE.USER_ID, userId);
        localStorage.setItem(DASHBOARD_CACHE.TIMESTAMP, Date.now().toString());
    } catch (error) {
        console.error('Error saving dashboard cache:', error);
        clearDashboardCache();
        // Retry once
        try {
            localStorage.setItem(DASHBOARD_CACHE.POSTS, JSON.stringify(posts));
            localStorage.setItem(DASHBOARD_CACHE.PROFILE, JSON.stringify(profile));
            localStorage.setItem(DASHBOARD_CACHE.RATINGS, JSON.stringify(ratings));
            localStorage.setItem(DASHBOARD_CACHE.USER_ID, userId);
            localStorage.setItem(DASHBOARD_CACHE.TIMESTAMP, Date.now().toString());
        } catch (retryError) {
            console.error('Failed to save dashboard cache after retry:', retryError);
        }
    }
};

const clearDashboardCache = () => {
    try {
        Object.values(DASHBOARD_CACHE).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing dashboard cache:', error);
    }
};

const updateCachedProfile = (userId, profile) => {
    try {
        if (isDashboardCacheValid(userId)) {
            localStorage.setItem(DASHBOARD_CACHE.PROFILE, JSON.stringify(profile));
        }
    } catch (error) {
        console.error('Error updating cached profile:', error);
    }
};

const STAT_CONFIGS = [
    { 
        icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", 
        label: "Total Posts", 
        colorClasses: "bg-blue-50 text-blue-600",
        getValue: (postCount) => postCount
    },
    { 
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", 
        label: "Published", 
        colorClasses: "bg-emerald-50 text-emerald-600",
        getValue: (postCount, activePosts) => activePosts.length
    },
    { 
        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", 
        label: "Drafts", 
        colorClasses: "bg-amber-50 text-amber-600",
        span: "col-span-2 md:col-span-1",
        getValue: (postCount, activePosts, draftPosts) => draftPosts.length
    }
];

const BENEFIT_ICONS = [
    { 
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", 
        label: "Stats", 
        colorClasses: "bg-emerald-50 text-emerald-600" 
    },
    { 
        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", 
        label: "Writing", 
        colorClasses: "bg-blue-50 text-blue-600" 
    },
    { 
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z", 
        label: "Network", 
        colorClasses: "bg-purple-50 text-purple-600" 
    }
];


function Dashboard() {
    const posts = useSelector((state) => state.dashboard.userPosts);
    const cachedProfile = useSelector((state) => state.dashboard.userProfile); 
    const cachedRatings = useSelector((state) => state.ratings.postRatings);
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    const currentUserId = useSelector((state) => state.auth.userData?.$id);
    const dispatch = useDispatch();

    const [userBio, setUserBio] = useState(cachedProfile.bio || "");
    const [username, setUsername] = useState(cachedProfile.username || "");
    const [loading, setLoading] = useState(false);
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);
    
    const isMountedRef = useRef(true);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { draftPosts, activePosts, postCount } = useMemo(() => ({
        draftPosts: posts.filter((post) => post.Status === 'draft'),
        activePosts: posts.filter((post) => post.Status === 'active'),
        postCount: posts.length
    }), [posts]);

    // ✅ OPTIMIZED: Return full rating object { average, count }
    const prefetchRatings = useCallback(async (postsList) => {
        if (!postsList || postsList.length === 0) return {};
        if (!isMountedRef.current) return {};
        
        try {
            const postsNeedingRatings = postsList.filter(post => 
                cachedRatings[post.$id] === undefined
            );
            
            if (postsNeedingRatings.length === 0) {
                return cachedRatings;
            }
            
            const ratingsPromises = postsNeedingRatings.map(post => 
                appwriteService.getPostRatings(post.$id)
                    .then(data => {
                        if (data && data.documents.length > 0) {
                            const total = data.documents.reduce((acc, curr) => acc + curr.stars, 0);
                            const avg = parseFloat((total / data.documents.length).toFixed(1));
                            
                            // ✅ FIX: Match Redux structure
                            return { 
                                postId: post.$id, 
                                rating: { average: avg, count: data.documents.length } 
                            };
                        }
                        return null;
                    })
                    .catch(() => null)
            );

            const results = await Promise.all(ratingsPromises);
            
            if (!isMountedRef.current) return {};
            
            const newRatingsMap = {};
            results.forEach(result => {
                if (result) {
                    newRatingsMap[result.postId] = result.rating;
                }
            });

            if (Object.keys(newRatingsMap).length > 0) {
                dispatch(setMultipleRatings(newRatingsMap));
            }
            
            return { ...cachedRatings, ...newRatingsMap };
        } catch (error) {
            console.error("Error prefetching ratings:", error);
            return cachedRatings;
        }
    }, [dispatch, cachedRatings]);

    useEffect(() => {
        isMountedRef.current = true;

        if (!authStatus || !currentUserId) {
            setLoading(false);
            return;
        }

        if (hasFetchedRef.current) {
            return;
        }

        const loadDashboardData = async () => {
            setLoading(true);

            // Layer 1: Check LocalStorage (Dashboard only)
            const cachedData = getDashboardCache(currentUserId);
            
            if (cachedData) {
                if (isMountedRef.current) {
                    dispatch(setUserPosts(cachedData.posts));
                    dispatch(setUserProfile(cachedData.profile));
                    dispatch(setMultipleRatings(cachedData.ratings));
                    
                    setUserBio(cachedData.profile.bio);
                    setUsername(cachedData.profile.username);
                    setLoading(false);
                    hasFetchedRef.current = true;
                }
                return;
            }

            // Layer 2: Fetch Fresh from Appwrite
            try {
                const [profileRes, postsRes] = await Promise.all([
                    appwriteService.getUserProfile(currentUserId),
                    appwriteService.getPosts([
                        Query.equal("UserId", currentUserId), 
                        Query.orderDesc("$createdAt")
                    ])
                ]);

                if (!isMountedRef.current) return;

                const profileData = {
                    username: profileRes?.Username || "",
                    bio: profileRes?.Bio || "",
                    profileImageId: profileRes?.ProfileImageFileId || null
                };

                setUserBio(profileData.bio);
                setUsername(profileData.username);

                const userPosts = postsRes?.documents || [];
                const ratingsMap = await prefetchRatings(userPosts);

                if (!isMountedRef.current) return;

                // Save to Cache
                saveDashboardCache(currentUserId, userPosts, profileData, ratingsMap);

                dispatch(setUserProfile(profileData));
                dispatch(setUserPosts(userPosts));
                
                hasFetchedRef.current = true;

            } catch (error) {
                if (!isMountedRef.current) return;
                
                console.error("Error fetching dashboard data:", error);
                
                // Fallback: Try Stale Cache if network fails
                try {
                    const staleCache = localStorage.getItem(DASHBOARD_CACHE.POSTS);
                    const staleProfile = localStorage.getItem(DASHBOARD_CACHE.PROFILE);
                    const staleRatings = localStorage.getItem(DASHBOARD_CACHE.RATINGS);
                    
                    if (staleCache && staleProfile) {
                        const stalePosts = JSON.parse(staleCache);
                        const staleProfileData = JSON.parse(staleProfile);
                        const staleRatingsData = staleRatings ? JSON.parse(staleRatings) : {};
                        
                        dispatch(setUserPosts(stalePosts));
                        dispatch(setUserProfile(staleProfileData));
                        dispatch(setMultipleRatings(staleRatingsData));
                        
                        setUserBio(staleProfileData.bio);
                        setUsername(staleProfileData.username);
                    }
                } catch (cacheError) {
                    console.error('Failed to use stale cache:', cacheError);
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        loadDashboardData();

        return () => {
            isMountedRef.current = false;
        };
    }, [authStatus, currentUserId, dispatch, prefetchRatings]);

    const refetchProfile = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const profileRes = await appwriteService.getUserProfile(currentUserId);

            if (profileRes && isMountedRef.current) {
                const profileData = {
                    username: profileRes?.Username || "",
                    bio: profileRes?.Bio || "",
                    profileImageId: profileRes?.ProfileImageFileId || null
                };
                
                setUserBio(profileData.bio);
                setUsername(profileData.username);
                dispatch(setUserProfile(profileData));
                
                updateCachedProfile(currentUserId, profileData);
            }
        } catch (error) {
            console.error("Error refetching profile:", error);
        }
    }, [currentUserId, dispatch]);

    const refetchPosts = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const postsRes = await appwriteService.getPosts([
                Query.equal("UserId", currentUserId), 
                Query.orderDesc("$createdAt")
            ]);

            if (postsRes && isMountedRef.current) {
                const userPosts = postsRes.documents;
                const ratingsMap = await prefetchRatings(userPosts);
                
                dispatch(setUserPosts(userPosts));
                
                const currentProfile = {
                    username,
                    bio: userBio,
                    profileImageId: cachedProfile.profileImageId
                };
                saveDashboardCache(currentUserId, userPosts, currentProfile, ratingsMap);
            }
        } catch (error) {
            console.error("Error refetching posts:", error);
        }
    }, [currentUserId, dispatch, prefetchRatings, username, userBio, cachedProfile.profileImageId]);

    const openBioModal = useCallback(() => setIsBioModalOpen(true), []);
    const closeBioModal = useCallback(() => setIsBioModalOpen(false), []);
    
    const handleBioSaved = useCallback((newBio) => {
        setUserBio(newBio);
        
        const updatedProfile = { 
            username, 
            bio: newBio, 
            profileImageId: cachedProfile.profileImageId 
        };
        
        dispatch(setUserProfile(updatedProfile));
        updateCachedProfile(currentUserId, updatedProfile);
    }, [username, cachedProfile.profileImageId, currentUserId, dispatch]);

    if (!authStatus) {
        // ... (Keep existing unauthorized view JSX)
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
                                Your Creative Space
                            </h1>
                            <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
                                Join our thriving community of storytellers. Become a member to share your unique voice, track your story's impact, and grow your audience.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1">
                                        Sign In
                                    </button>
                                </Link>
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <button className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                                        Join the Community
                                    </button>
                                </Link>
                            </div>

                            <div className="pt-6 sm:pt-8 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">
                                    Member Benefits
                                </p>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                                    {BENEFIT_ICONS.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2">
                                            <div className={`p-2 ${item.colorClasses} rounded-lg`}>
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

    if (loading) {
        return <DashboardAuthSkeleton />;
    }

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
                {/* Profile Header */}
                <div className="gpu-accelerate bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    
                    <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
                        <div className="shrink-0">
                            <ProfilePictureManager 
                                initialFileId={cachedProfile.profileImageId} 
                                onProfileUpdate={refetchProfile}
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

                {/* Stats Section */}
                <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Overview</h2>
                    </div>
                    <Link to="/add-post" className="inline-flex items-center justify-center px-3 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95 hover:-translate-y-0.5 active:translate-y-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="max-[400px]:hidden">Create New Post</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
                    {STAT_CONFIGS.map((stat, index) => (
                        <div key={index} className={`gpu-accelerate bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 sm:gap-3 md:gap-4 ${stat.span || ''}`}>
                            <div className={`p-2 sm:p-3 ${stat.colorClasses} rounded-lg sm:rounded-xl shrink-0`}>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} /></svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{stat.getValue(postCount, activePosts, draftPosts)}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Posts Section */}
                <div className="space-y-8 sm:space-y-12">
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
    );
}

export default Dashboard;