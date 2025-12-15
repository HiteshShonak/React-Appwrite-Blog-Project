import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config.js'
import { PostCard, Container, Button } from '../Components'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const authStatus = useSelector((state) => state.auth.status);

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

    // 1. Loading State
    if (loading) {
        return (
            <div className='w-full min-h-screen bg-slate-50 flex items-center justify-center'>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading stories...</p>
                </div>
            </div>
        );
    }

    // 2. Not Logged In (Hero Section)
    if (!authStatus) {
        return (
            <div className="w-full min-h-screen bg-white">
                <Container>
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center max-w-4xl mx-auto">
                        <div className="mb-8 p-4 bg-blue-50 rounded-full inline-block">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Share your stories with the <span className="text-blue-600">world.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                            Discover stories, thinking, and expertise from writers on any topic. 
                            Join our community to start reading and writing today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login">
                                <Button className="!px-8 !py-3 !text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl">
                                    Start Reading
                                </Button>
                            </Link>
                            <Link to="/signup">
                                {/* FIX: Explicitly set text color to slate-900 and ensure button is visible */}
                                <Button className="!px-8 !py-3 !text-lg bg-white !text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    // 3. Logged In but No Posts
    if (posts.length === 0) {
        return (
            <div className='w-full min-h-screen bg-slate-50 py-12'>
                <Container>
                    <div className='text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto'>
                        <div className='text-slate-300 mb-6'>
                            <svg className='w-20 h-20 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                            </svg>
                        </div>
                        <h2 className='text-2xl font-bold text-slate-800 mb-2'>It's quiet here...</h2>
                        <p className='text-slate-500 mb-8'>No posts have been published yet.</p>
                        <Link to="/add-post">
                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                Write the first post
                            </Button>
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    // 4. Logged In with Posts
    return (
        <div className='w-full min-h-screen bg-slate-50 py-12'>
            <Container>
                <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className='text-3xl font-bold text-slate-900'>Latest Posts</h2>
                        <p className='text-slate-500 mt-1 text-sm'>Fresh content from the community</p>
                    </div>
                    <Link to="/all-posts" className="text-blue-600 font-medium hover:underline text-sm hidden md:block">
                        View all &rarr;
                    </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {posts.map((post) => (
                        <div key={post.$id} className="h-full">
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home