import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config.js'
import { PostCard, Container } from '../Components'

function AllPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        appwriteService.getPosts().then((response) => {
            if (response && response.documents) {
                setPosts(response.documents);
            }
        }).catch((error) => {
            console.log("Error fetching posts:", error);
        }).finally(() => setLoading(false));
    }, []);


    if (loading) {
        return (
            <div className='py-8 min-h-[60vh] flex items-center justify-center'>
                <Container>
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading content...</p>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className='py-8 bg-slate-50 min-h-screen text-gray-800'>
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
                    /* GRID UPDATES:
                       - md:grid-cols-2 (Tablets)
                       - lg:grid-cols-3 (Laptops)
                       - xl:grid-cols-4 (Desktops -> This makes cards smaller)
                    */
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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