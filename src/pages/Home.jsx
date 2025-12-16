import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config.js'
import { PostCard, Container, Button } from '../Components'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const authStatus = useSelector((state) => state.auth.status);
    const navigate = useNavigate();

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

    const handleCardClick = (e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        if (authStatus) {
            navigate(`/post/${postId}`);
        } else {
            navigate('/login');
        }
    }

    if (loading) {
        return (
            <div className='w-full min-h-screen bg-slate-50 flex items-center justify-center'>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading Home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden flex flex-col justify-center">
            
            {/* ANIMATION SETTINGS */}
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .paused {
                    animation-play-state: paused;
                }
            `}</style>

            <Container>
                {/* UPDATED: Changed max-w-5xl to max-w-7xl.
                   This ensures the text content doesn't look too narrow on full-screen desktop views.
                */}
                <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center max-w-7xl mx-auto">
                    
                    {/* HERO TEXT */}
                    <div className="mb-6 p-3 bg-blue-50 rounded-2xl inline-block animate-bounce">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Share your stories with the <span className="text-blue-600">world.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl leading-relaxed mx-auto">
                        Discover stories, thinking, and expertise from writers on any topic. 
                        Join our community to start reading and writing today.
                    </p>


                    {/* SCROLLING CONTAINER (Breakout) */}
                    <div className="w-screen my-12 mt-6 overflow-hidden bg-white/60 border-y border-slate-200 pt-4 pb-12 backdrop-blur-sm group relative">
                        
                        {/* CENTERED LABEL */}
                        <div className="text-center mb-8 relative z-30">
                            <span className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                🔥 Trending Posts
                            </span>
                        </div>

                        {/* LEFT FADE / BLUR
                           Updated: Added `2xl:w-96` to make the fade wider on huge screens.
                        */}
                        <div className="absolute top-0 left-0 w-32 md:w-64 2xl:w-96 h-full bg-linear-to-r from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none"></div>

                        {/* RIGHT FADE / BLUR
                           Updated: Added `2xl:w-96` here too.
                        */}
                        <div className="absolute top-0 right-0 w-32 md:w-64 2xl:w-96 h-full bg-linear-to-l from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none"></div>


                        {/* THE MOVING TRACK */}
                        <div className="flex w-max animate-scroll group-hover:paused items-center">
                            
                            {[...posts, ...posts, ...posts, ...posts, ...posts, ...posts].map((post, index) => (
                                <div 
                                    key={`${post.$id}-${index}`} 
                                    className="w-75 mx-5 transform transition-transform duration-300 hover:scale-105 cursor-pointer text-left shadow-sm hover:shadow-xl rounded-xl z-10"
                                    onClick={(e) => handleCardClick(e, post.$id)}
                                >
                                    <div className="pointer-events-none bg-white rounded-xl h-full overflow-hidden border border-slate-100"> 
                                        <div className='w-full h-40 bg-slate-200'>
                                            <img src={appwriteService.getFileView(post.featuredImage)} alt={post.Title} className='w-full h-full object-cover' />
                                        </div>
                                        <div className='p-4'>
                                            <h3 className='font-bold text-slate-800 truncate'>{post.Title}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {posts.length === 0 && (
                                <div className="w-screen text-center text-slate-400 font-medium z-10">
                                    No trending posts available right now.
                                </div>
                            )}
                        </div>
                    </div>


                    {/* CTA BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 relative z-20 mt-4">
                        {authStatus ? (
                            <>
                                <Link to="/all-posts">
                                    <Button className="px-8! py-3! text-lg! bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        Explore All Posts
                                    </Button>
                                </Link>
                                <Link to="/add-post">
                                    <Button className="px-8! py-3! text-lg! bg-white text-slate-900! border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                        Write a Story
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button className="px-8! py-3! text-lg! bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        Start Reading
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="px-8! py-3! text-lg! bg-white text-slate-900! border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                        Create Account
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </Container>
        </div>
    )
}

export default Home