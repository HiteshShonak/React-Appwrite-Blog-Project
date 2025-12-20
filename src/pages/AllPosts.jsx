import React, { useState, useEffect, useCallback, useRef } from 'react';
import appwriteService from '../appwrite/config.js';
import { PostCard, Container } from '../Components';
import { useSelector, useDispatch } from 'react-redux';
import { setPosts } from '../Store/postSlice';
import { setMultipleRatings } from '../Store/ratingSlice';
import { AllPostsSkeleton } from '../Components/Skeletons.jsx';

// ============================================================
// 🗄️ LOCALSTORAGE CACHE UTILITIES
// ============================================================
const CACHE_KEYS = {
    ALL_POSTS: 'all_posts_cache',
    ALL_RATINGS: 'all_posts_ratings_cache',
    CACHE_TIMESTAMP: 'all_posts_cache_timestamp'
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const isCacheValid = () => {
    try {
        const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
        if (!timestamp) return false;
        
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        return cacheAge < CACHE_DURATION;
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
};

const getCachedData = () => {
    try {
        if (!isCacheValid()) {
            clearCache();
            return null;
        }

        const postsData = localStorage.getItem(CACHE_KEYS.ALL_POSTS);
        const ratingsData = localStorage.getItem(CACHE_KEYS.ALL_RATINGS);

        if (!postsData) return null;

        return {
            posts: JSON.parse(postsData),
            ratings: ratingsData ? JSON.parse(ratingsData) : {}
        };
    } catch (error) {
        console.error('Error reading cache:', error);
        clearCache();
        return null;
    }
};

const saveCacheData = (posts, ratings) => {
    try {
        localStorage.setItem(CACHE_KEYS.ALL_POSTS, JSON.stringify(posts));
        localStorage.setItem(CACHE_KEYS.ALL_RATINGS, JSON.stringify(ratings));
        localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
        console.error('Error saving cache:', error);
        clearCache();
        try {
            localStorage.setItem(CACHE_KEYS.ALL_POSTS, JSON.stringify(posts));
            localStorage.setItem(CACHE_KEYS.ALL_RATINGS, JSON.stringify(ratings));
            localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        } catch (retryError) {
            console.error('Failed to save cache after retry:', retryError);
        }
    }
};

const clearCache = () => {
    try {
        Object.values(CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

function AllPosts() {
    const posts = useSelector((state) => state.posts.posts);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const isMountedRef = useRef(true);
    const hasFetchedRef = useRef(false);

    const postCount = posts.length;

    // ✅ PERFECT: Prefetch ratings with guard clause
    const prefetchRatings = useCallback(async (postsList) => {
        // ✅ GEMINI'S FIX: Guard clause for empty arrays
        if (!postsList || postsList.length === 0) return {};
        
        if (!isMountedRef.current) return {};
        
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
            
            if (!isMountedRef.current) return {};
            
            const ratingsMap = {};
            results.forEach(result => {
                if (result) {
                    ratingsMap[result.postId] = result.rating;
                }
            });

            // ✅ Only dispatch if we have ratings
            if (Object.keys(ratingsMap).length > 0) {
                dispatch(setMultipleRatings(ratingsMap));
            }
            
            return ratingsMap;
        } catch (error) {
            console.error("Error prefetching ratings:", error);
            return {};
        }
    }, [dispatch]);

    // ✅ Multi-layer caching: Redux → localStorage → Database
    useEffect(() => {
        isMountedRef.current = true;

        if (hasFetchedRef.current) {
            return;
        }

        const fetchData = async () => {
            // Layer 1: Check Redux cache
            if (posts.length > 0) {
                hasFetchedRef.current = true;
                return;
            }

            setLoading(true);

            // Layer 2: Check localStorage cache
            const cachedData = getCachedData();
            
            if (cachedData && cachedData.posts.length > 0) {
                if (isMountedRef.current) {
                    dispatch(setPosts(cachedData.posts));
                    
                    // ✅ Only dispatch ratings if we have any
                    if (Object.keys(cachedData.ratings).length > 0) {
                        dispatch(setMultipleRatings(cachedData.ratings));
                    }
                    
                    setLoading(false);
                    hasFetchedRef.current = true;
                }
                return;
            }

            // Layer 3: Fetch from database
            try {
                const response = await appwriteService.getPosts();
                
                if (!isMountedRef.current) return;
                
                if (response?.documents) {
                    const allPosts = response.documents;
                    const ratingsMap = await prefetchRatings(allPosts);

                    if (!isMountedRef.current) return;

                    // ✅ Save to cache
                    saveCacheData(allPosts, ratingsMap);

                    // ✅ Update Redux
                    dispatch(setPosts(allPosts));
                    // Ratings already dispatched by prefetchRatings (if any)
                    
                    hasFetchedRef.current = true;
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                
                // Try stale cache on error
                try {
                    const staleCacheData = localStorage.getItem(CACHE_KEYS.ALL_POSTS);
                    const staleRatingsData = localStorage.getItem(CACHE_KEYS.ALL_RATINGS);
                    
                    if (staleCacheData) {
                        const stalePosts = JSON.parse(staleCacheData);
                        const staleRatings = staleRatingsData ? JSON.parse(staleRatingsData) : {};
                        
                        dispatch(setPosts(stalePosts));
                        
                        if (Object.keys(staleRatings).length > 0) {
                            dispatch(setMultipleRatings(staleRatings));
                        }
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

        fetchData();

        return () => {
            isMountedRef.current = false;
        };
    }, [dispatch, prefetchRatings]);

    if (loading) {
        return <AllPostsSkeleton />;
    }

    return (
        <div className='py-6 sm:py-8 bg-slate-50 min-h-screen text-gray-800 page-anim px-2 sm:px-4'>
            <Container>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 border-b border-slate-200 pb-3 sm:pb-4">
                    <h1 className='text-2xl md:text-3xl font-bold text-slate-800 tracking-tight'>
                        Latest Articles
                    </h1>
                    <span className="text-slate-500 text-xs sm:text-sm mt-2 sm:mt-0 font-medium bg-white px-2.5 sm:px-3 py-1 rounded-full border shadow-sm">
                        {postCount} {postCount === 1 ? 'Story' : 'Stories'}
                    </span>
                </div>
                
                {postCount === 0 ? (
                    <div className='gpu-accelerate text-center py-12 sm:py-20 bg-white rounded-xl shadow-sm border border-slate-100'>
                        <div className='text-slate-300 mb-3 sm:mb-4'>
                            <svg className='w-12 h-12 sm:w-16 sm:h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
                            </svg>
                        </div>
                        <h3 className='text-lg sm:text-xl font-bold text-slate-700 mb-2'>No Posts Yet</h3>
                        <p className='text-slate-500 text-sm'>
                            Be the first one to share your story with the world!
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6'>
                        {posts.map((post) => (
                            <div key={post.$id} className="h-full">
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default AllPosts;