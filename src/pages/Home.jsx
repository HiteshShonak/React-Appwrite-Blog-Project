import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import appwriteService from '../appwrite/config.js';
import { Container, Button } from '../Components';
import { useSelector, useDispatch } from 'react-redux';
import { setTrendingPosts } from '../Store/homeSlice';
import { setMultipleRatings } from '../Store/ratingSlice';
import { Link } from 'react-router-dom';
import { HomeSkeleton } from '../Components/Skeletons.jsx';

// Memoized trending card component
const TrendingCard = memo(({ post, onClick }) => {
    const cachedRating = useSelector((state) => state.ratings?.postRatings?.[post.$id]);
    const rating = cachedRating || null;

    return (
        <div 
            className="gpu-accelerate interactive w-72 md:w-80 mx-5 transform transition-transform duration-500 hover:scale-105 cursor-pointer text-left shadow-sm hover:shadow-xl rounded-xl z-10"
            onClick={(e) => onClick(e, post.$id)}
        >
            <div className="gpu-accelerate pointer-events-none bg-white rounded-xl h-full overflow-hidden border border-slate-100 relative group"> 
                
                <div className='w-full h-40 bg-slate-200 relative'>
                    <img 
                        src={appwriteService.getFileView(post.featuredImage)} 
                        alt={post.Title} 
                        className='w-full h-full object-cover' 
                    />
                    
                    {rating && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-gray-100 z-10">
                            <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-800">{rating}</span>
                        </div>
                    )}
                </div>

                <div className='p-3'>
                    <h3 className='font-bold text-slate-800 truncate text-sm md:text-base'>{post.Title}</h3>
                </div>
            </div>
        </div>
    );
});

TrendingCard.displayName = 'TrendingCard';

function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authStatus = useSelector((state) => state.auth.status);
    const trending = useSelector((state) => state.home.trendingPosts);
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(trending.length === 0);

    const carouselItems = useMemo(() => {
        if (trending.length === 0) return [];
        return Array(6).fill(trending).flat();
    }, [trending]);

    // Fetch trending posts if not cached
    useEffect(() => {
        if (trending.length === 0) {
            setLoading(true);

            const fetchData = async () => {
                try {
                    const minWait = new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const dataFetch = Promise.all([
                        appwriteService.getPosts(),
                        appwriteService.getTrendingPosts()
                    ]);

                    const [[postsResponse, trendingResponse]] = await Promise.all([dataFetch, minWait]);

                    if (postsResponse?.documents) {
                        setPosts(postsResponse.documents);
                    }

                    if (trendingResponse?.length > 0) {
                        // ✅ FETCH RATINGS FIRST (don't dispatch posts yet!)
                        const ratingsPromises = trendingResponse.map(post => 
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

                        // ✅ DISPATCH BOTH AT THE SAME TIME (single render!)
                        dispatch(setMultipleRatings(ratingsMap));
                        dispatch(setTrendingPosts(trendingResponse));
                    } else {
                        dispatch(setTrendingPosts([]));
                    }

                } catch (error) {
                    console.error("Error fetching home data:", error);
                } finally {
                    // ✅ HIDE LOADING AFTER EVERYTHING IS READY
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            setLoading(false);
        }
    }, [trending.length, dispatch]);

    const handleCardClick = useCallback((e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(authStatus ? `/post/${postId}` : '/login');
    }, [authStatus, navigate]);

    if (loading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden flex flex-col justify-center page-anim px-2 sm:px-4">
            <Container>
                <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center max-w-7xl mx-auto">
                    
                    <div className="gpu-accelerate mb-6 p-3 bg-blue-50 rounded-2xl inline-block animate-bounce">
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

                    {/* Trending posts carousel */}
                    <div className="gpu-accelerate w-screen my-12 mt-6 overflow-hidden bg-white/60 border-y border-slate-200 pt-4 pb-12 backdrop-blur-sm group relative">
                        
                        <div className="text-center mb-8 relative z-30">
                            <span className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                🔥 Trending Posts
                            </span>
                        </div>

                        <div className="absolute top-0 left-0 w-16 md:w-64 2xl:w-96 h-full bg-linear-to-r from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-16 md:w-64 2xl:w-96 h-full bg-linear-to-l from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none"></div>

                        <div className="flex w-max animate-scroll group-hover:paused items-center">
                            {carouselItems.length > 0 ? (
                                carouselItems.map((post, index) => (
                                    <TrendingCard 
                                        key={`${post.$id}-${index}`} 
                                        post={post} 
                                        onClick={handleCardClick} 
                                    />
                                ))
                            ) : (
                                <div className="w-screen text-center text-slate-400 font-medium z-10">
                                    No trending posts available right now.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA buttons */}
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
    );
}

export default Home;