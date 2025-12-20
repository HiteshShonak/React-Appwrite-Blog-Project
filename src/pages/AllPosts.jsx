import React, { useState, useEffect, useMemo, useCallback } from 'react';
import appwriteService from '../appwrite/config.js';
import { PostCard, Container } from '../Components';
import { Query } from 'appwrite';
import { useSelector, useDispatch } from 'react-redux';
import { setPosts } from '../Store/postSlice';
import { setMultipleRatings } from '../Store/ratingSlice';
import { AllPostsSkeleton } from '../Components/Skeletons.jsx';


function AllPosts() {
    const posts = useSelector((state) => state.posts.posts);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(posts.length === 0);

    const postCount = useMemo(() => posts.length, [posts.length]);

    // ✅ MOVE prefetchRatings OUTSIDE useEffect (using useCallback)
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
    }, [dispatch]); // ✅ Add dispatch as dependency

    // ✅ FIXED useEffect - now reacts to posts changes
    useEffect(() => {
        if (posts.length === 0) {
            setLoading(true);
            
            appwriteService.getPosts().then(async (response) => {
                if (response?.documents) {
                    dispatch(setPosts(response.documents));
                    await prefetchRatings(response.documents);
                }
            }).catch((error) => {
                console.error("Error fetching posts:", error);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
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