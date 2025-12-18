import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { Container, PostCard } from '../Components';
import { Query } from 'appwrite';


function AuthorProfile() {
    const { username } = useParams();
    
    const [posts, setPosts] = useState([]);
    const [authorProfile, setAuthorProfile] = useState(null);
    const [authorName, setAuthorName] = useState("Author");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    // Memoized computed values
    const initials = useMemo(() => 
        authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU',
        [authorName]
    );

    const fetchAuthorData = useCallback(async () => {
        if (!username) {
            setLoading(false);
            return;
        }

        try {
            // Fetch profile by username
            const profileData = await appwriteService.getProfileByUsername(username);

            if (profileData) {
                setAuthorProfile(profileData);
                
                // Set avatar if available
                if (profileData.ProfileImageFileId) {
                    setAvatarUrl(appwriteService.getAvatarPreview(profileData.ProfileImageFileId));
                }

                // Fetch author's posts
                const postsData = await appwriteService.getPosts([
                    Query.equal("UserId", profileData.UserId),
                    Query.equal("Status", "active"),
                    Query.orderDesc("$createdAt")
                ]);

                if (postsData?.documents?.length > 0) {
                    setPosts(postsData.documents);
                    setAuthorName(postsData.documents[0].AuthorName);
                } else {
                    setAuthorName(profileData.Username);
                }
            }

        } catch (error) {
            console.error("Error fetching author data:", error);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchAuthorData();
    }, [fetchAuthorData]);

    // Skeleton loading screen
    if (loading) {
        return (
            <div className='w-full min-h-screen bg-slate-50 py-8 sm:py-12 px-2 sm:px-4 animate-pulse'>
                <Container>
                    {/* Profile card skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 sm:mb-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                            {/* Avatar skeleton */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 shrink-0"></div>
                            
                            {/* Name & stats skeleton */}
                            <div className="flex-1 pt-2 w-full">
                                <div className="h-8 sm:h-9 bg-slate-200 rounded-lg w-48 mx-auto md:mx-0 mb-2"></div>
                                <div className="h-6 bg-slate-200 rounded w-32 mx-auto md:mx-0 mb-3 sm:mb-4"></div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="h-5 bg-slate-200 rounded w-24"></div>
                                    <div className="h-5 bg-slate-200 rounded w-32"></div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 sm:my-8 border-slate-100" />

                        {/* Bio skeleton */}
                        <div>
                            <div className="h-6 bg-slate-200 rounded w-32 mb-3 mx-auto md:mx-0"></div>
                            <div className="space-y-2 max-w-3xl">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>

                    {/* Posts grid skeleton */}
                    <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                        <div className="h-6 sm:h-8 w-1.5 bg-slate-200 rounded-full"></div>
                        <div className="h-7 sm:h-8 bg-slate-200 rounded w-40"></div>
                    </div>
                    
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="h-40 sm:h-48 bg-slate-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>
        );
    }

    // Profile not found
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
                
                {/* Profile card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 sm:mb-12">
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 text-center md:text-left">
                        
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-indigo-50">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-2xl sm:text-3xl font-bold">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & stats */}
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

                    {/* Bio section */}
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

                {/* Posts grid */}
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
                    <div className="h-6 sm:h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Latest Articles</h2>
                </div>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                    {posts.map((post) => (
                        <div key={post.$id}>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>

            </Container>
        </div>
    );
}

export default AuthorProfile;