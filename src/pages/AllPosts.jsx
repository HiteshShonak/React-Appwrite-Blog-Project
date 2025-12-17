import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config.js'
import { PostCard, Container } from '../Components'
import { Query } from 'appwrite'
// 🚨 NEW IMPORTS FOR REDUX
import { useSelector, useDispatch } from 'react-redux';
import { setPosts } from '../Store/postSlice'; 

function AllPosts() {
    // 🚨 1. Access Redux Store
    const posts = useSelector((state) => state.posts.posts);
    const dispatch = useDispatch();

    // 🚨 2. Smart Loading State: Only load if Redux is empty
    const [loading, setLoading] = useState(posts.length === 0);

    useEffect(() => {
        // 🚨 3. Caching Logic: If we already have posts, don't refetch
        if (posts.length === 0) {
            setLoading(true);
            
            appwriteService.getPosts([
                Query.orderDesc("$createdAt")
            ]).then((response) => {
                if (response && response.documents) {
                    // 🚨 4. Save fetched posts to Redux
                    dispatch(setPosts(response.documents));
                }
            }).catch((error) => {
                console.log("Error fetching posts:", error);
            }).finally(() => setLoading(false));
        } else {
            // Data exists in Redux -> Stop loading immediately
            setLoading(false);
        }
    }, []); // Run once on mount

    // ------------------------------------------------------------------
    // 💀 SKELETON LOADER (Exact same styling)
    // ------------------------------------------------------------------
    if (loading) {
        return (
            <div className='py-8 bg-slate-50 min-h-screen animate-pulse'>
                <Container>
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-200 pb-4">
                        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                        <div className="h-6 w-24 bg-slate-200 rounded-full mt-2 md:mt-0"></div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className='grid m-2 sm:m-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                            <div key={item} className="bg-white rounded-xl overflow-hidden h-full border border-slate-100">
                                {/* Image Placeholder */}
                                <div className="aspect-video w-full bg-slate-200"></div>
                                {/* Content Placeholder */}
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className='py-8 bg-slate-50 min-h-screen text-gray-800 page-anim'>
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className='text-2xl md:text-3xl font-bold text-slate-800 tracking-tight'>
                        Latest Articles
                    </h1>
                    <span className="text-slate-500 text-sm mt-2 md:mt-0 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
                        {posts.length} Stories
                    </span>
                </div>
                
                {posts.length === 0 ? (
                    <div className='text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100'>
                        <div className='text-slate-300 mb-4'>
                            <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold text-slate-700 mb-2'>No Posts Yet</h3>
                        <p className='text-slate-500 text-sm'>
                            Be the first one to share your story with the world!
                        </p>
                    </div>
                ) : (
                    /* GRID LAYOUT (Exact same styling) */
                    <div className='grid m-2 sm:m-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                        {posts.map((post) => (
                            <div key={post.$id} className="h-full">
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default AllPosts