import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { Container, PostCard } from '../Components';
import { Query } from 'appwrite';
import { AuthorProfileSkeleton } from '../Components/Skeletons';
import { useDispatch, useSelector } from 'react-redux';
import { setMultipleRatings } from '../Store/ratingSlice';


const AUTHOR_CACHE_PREFIX = 'author_profile_';
const CACHE_DURATION = 20 * 60 * 1000;

const getAuthorCacheKey = (username) => `${AUTHOR_CACHE_PREFIX}${username}`;
const getAuthorTimestampKey = (username) => `${AUTHOR_CACHE_PREFIX}${username}_timestamp`;
const getAuthorRatingsKey = (username) => `${AUTHOR_CACHE_PREFIX}${username}_ratings`;

const isAuthorCacheValid = (username) => {
    try {
        const timestampKey = getAuthorTimestampKey(username);
        const timestamp = localStorage.getItem(timestampKey);
        
        if (!timestamp) return false;
        
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        return cacheAge < CACHE_DURATION;
    } catch (error) {
        console.error('Error checking author cache validity:', error);
        return false;
    }
};

const getAuthorCache = (username) => {
    try {
        if (!isAuthorCacheValid(username)) {
            clearAuthorCache(username);
            return null;
        }

        const cacheKey = getAuthorCacheKey(username);
        const ratingsKey = getAuthorRatingsKey(username);
        const cachedData = localStorage.getItem(cacheKey);
        const cachedRatings = localStorage.getItem(ratingsKey);

        if (!cachedData) return null;

        const data = JSON.parse(cachedData);
        const ratings = cachedRatings ? JSON.parse(cachedRatings) : {};

        return { ...data, ratings };
    } catch (error) {
        console.error('Error reading author cache:', error);
        clearAuthorCache(username);
        return null;
    }
};

const saveAuthorCache = (username, profile, posts, authorName, avatarUrl, ratings) => {
    try {
        const cacheKey = getAuthorCacheKey(username);
        const timestampKey = getAuthorTimestampKey(username);
        const ratingsKey = getAuthorRatingsKey(username);

        const dataToCache = {
            profile,
            posts,
            authorName,
            avatarUrl
        };

        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        localStorage.setItem(ratingsKey, JSON.stringify(ratings));
        localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
        console.error('Error saving author cache:', error);
        clearAuthorCache(username);
        try {
            const cacheKey = getAuthorCacheKey(username);
            const timestampKey = getAuthorTimestampKey(username);
            const ratingsKey = getAuthorRatingsKey(username);
            
            localStorage.setItem(cacheKey, JSON.stringify({
                profile, posts, authorName, avatarUrl
            }));
            localStorage.setItem(ratingsKey, JSON.stringify(ratings));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (retryError) {
            console.error('Failed to save author cache after retry:', retryError);
        }
    }
};

const clearAuthorCache = (username) => {
    try {
        localStorage.removeItem(getAuthorCacheKey(username));
        localStorage.removeItem(getAuthorTimestampKey(username));
        localStorage.removeItem(getAuthorRatingsKey(username));
    } catch (error) {
        console.error('Error clearing author cache:', error);
    }
};


function AuthorProfile() {
    const { username } = useParams();
    const dispatch = useDispatch();
    
    const [posts, setPosts] = useState([]);
    const [authorProfile, setAuthorProfile] = useState(null);
    const [authorName, setAuthorName] = useState("Author");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    const cachedRatings = useSelector((state) => state.ratings.postRatings);

    const initials = useMemo(() => 
        authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU',
        [authorName]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [username]);

    const prefetchRatings = useCallback(async (postsList) => {
        if (!postsList || postsList.length === 0) return {};
        
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
                            return { postId: post.$id, rating: avg };
                        }
                        return null;
                    })
                    .catch(() => null)
            );

            const results = await Promise.all(ratingsPromises);
            
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
        if (!username) {
            setLoading(false);
            return;
        }

        let isCancelled = false;

        const fetchAuthorData = async () => {
            setLoading(true);

            const cachedData = getAuthorCache(username);
            
            if (cachedData) {
                if (!isCancelled) {
                    setAuthorProfile(cachedData.profile);
                    setPosts(cachedData.posts);
                    setAuthorName(cachedData.authorName);
                    setAvatarUrl(cachedData.avatarUrl);
                    
                    dispatch(setMultipleRatings(cachedData.ratings));
                    
                    setLoading(false);
                }
                return;
            }

            try {
                const profileData = await appwriteService.getProfileByUsername(username);

                if (isCancelled) return;

                if (profileData) {
                    setAuthorProfile(profileData);
                    
                    let avatar = null;
                    if (profileData.ProfileImageFileId) {
                        avatar = appwriteService.getAvatarPreview(profileData.ProfileImageFileId);
                        setAvatarUrl(avatar);
                    }

                    const postsData = await appwriteService.getPosts([
                        Query.equal("UserId", profileData.UserId),
                        Query.equal("Status", "active"),
                        Query.orderDesc("$createdAt")
                    ]);

                    if (isCancelled) return;

                    let displayName = profileData.Username;
                    let authorPosts = [];

                    if (postsData?.documents?.length > 0) {
                        authorPosts = postsData.documents;
                        setPosts(authorPosts);
                        displayName = postsData.documents[0].AuthorName;
                        setAuthorName(displayName);
                    } else {
                        setAuthorName(displayName);
                    }

                    const ratingsMap = await prefetchRatings(authorPosts);

                    if (isCancelled) return;

                    saveAuthorCache(
                        username,
                        profileData,
                        authorPosts,
                        displayName,
                        avatar,
                        ratingsMap
                    );
                }

            } catch (error) {
                if (!isCancelled) {
                    console.error("Error fetching author data:", error);
                    
                    try {
                        const staleCache = localStorage.getItem(getAuthorCacheKey(username));
                        const staleRatings = localStorage.getItem(getAuthorRatingsKey(username));
                        
                        if (staleCache) {
                            const staleData = JSON.parse(staleCache);
                            const staleRatingsData = staleRatings ? JSON.parse(staleRatings) : {};
                            
                            setAuthorProfile(staleData.profile);
                            setPosts(staleData.posts);
                            setAuthorName(staleData.authorName);
                            setAvatarUrl(staleData.avatarUrl);
                            dispatch(setMultipleRatings(staleRatingsData));
                        }
                    } catch (cacheError) {
                        console.error('Failed to use stale cache:', cacheError);
                    }
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchAuthorData();

        return () => {
            isCancelled = true;
        };
    }, [username, dispatch, prefetchRatings]);

    if (loading) {
        return <AuthorProfileSkeleton />;
    }

    if (!authorProfile && !loading) {
        return (
            <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center px-2 sm:px-4 page-anim">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.74 13.74l2 2m0 0l2 2m-2-2l-2 2m2-2l2-2M3 16v-1a4 4 0 014.475-3.974m3.333-3.333A3.994 3.994 0 0112 4a4 4 0 014 4c0 .583-.11 1.14-.309 1.648" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 16v-1a4 4 0 01.309-1.648" />
                    </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
                    Profile Not Found
                </h1>
                
                <p className="text-slate-500 max-w-sm mx-auto mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                    We couldn't find the author you are looking for. They may have changed their username or the account no longer exists.
                </p>

                <Link to="/">
                    <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95">
                        Back to Home
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-slate-50 py-8 sm:py-12 px-2 sm:px-4 page-anim'>
            <Container>
                
                <div className="gpu-accelerate bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 sm:mb-12">
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 text-center md:text-left">
                        
                        <div className="shrink-0">
                            <div className="gpu-accelerate w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-indigo-50">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-2xl sm:text-3xl font-bold">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 pt-0 sm:pt-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-1">
                                {authorName}
                            </h1>
                            
                            <p className="text-slate-500 font-medium text-base sm:text-lg mb-3">
                                @{authorProfile.Username}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                                <span>Writer @ BlogApp</span>
                                <span className="hidden md:inline">&bull;</span>
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {posts.length} Articles Published
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="my-6 sm:my-8 border-slate-100" />

                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 flex items-center justify-center md:justify-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            About Me
                        </h3>
                        <div className="max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap text-center md:text-left">
                            {authorProfile?.Bio ? authorProfile.Bio : (
                                <p className="italic text-slate-400">This author prefers to let their writing speak for itself.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
                    <div className="h-6 sm:h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Latest Articles</h2>
                </div>
                
                {posts.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                        {posts.map((post) => (
                            <div key={post.$id}>
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="gpu-accelerate bg-white rounded-xl p-8 sm:p-12 text-center border-2 border-slate-100 border-dashed">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-slate-300 mx-auto">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No Published Articles</h3>
                        <p className="text-sm sm:text-base text-slate-500">This author hasn't published any articles yet.</p>
                    </div>
                )}

            </Container>
        </div>
    );
}

export default AuthorProfile;