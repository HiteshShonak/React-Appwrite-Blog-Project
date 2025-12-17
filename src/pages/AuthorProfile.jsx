import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { Container, PostCard } from '../Components';
import { Query } from 'appwrite';

function AuthorProfile() {
    // 1. Grab the parameter from the URL
    // NOTE: In main.jsx, your route MUST be path: "/author/:username"
    const { username } = useParams();
    
    const [posts, setPosts] = useState([]);
    const [authorProfile, setAuthorProfile] = useState(null);
    const [authorName, setAuthorName] = useState("Author");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (!username) {
                setDebugInfo("Error: No username found in URL. Check main.jsx route.");
                setLoading(false);
                return;
            }

            try {
                // 🚨 2. Call the function from your snippet
                // We pass the username from the URL (e.g., "cool_writer")
                const profileData = await appwriteService.getProfileByUsername(username);

                if (profileData) {
                    setAuthorProfile(profileData);
                    
                    // Set Avatar using the helper from your snippet (assumed exists in class)
                    if (profileData.ProfileImageFileId) {
                        setAvatarUrl(appwriteService.getAvatarPreview(profileData.ProfileImageFileId));
                    }

                    // 3. Fetch Posts using the UserId we just found
                    const postsData = await appwriteService.getPosts([
                        Query.equal("UserId", profileData.UserId), // Use ID from profile
                        Query.equal("Status", "active"),
                        Query.orderDesc("$createdAt")
                    ]);

                    if (postsData && postsData.documents.length > 0) {
                        setPosts(postsData.documents);
                        setAuthorName(postsData.documents[0].AuthorName);
                    } else {
                        // Fallback name if no posts
                        setAuthorName(profileData.Username);
                    }
                } else {
                    setDebugInfo(`Error: Could not find a profile with Username = "${username}"`);
                }

            } catch (error) {
                console.error("Error fetching author data:", error);
                setDebugInfo(`System Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, [username]);

    // --- Loading View ---
    if (loading) {
        return (
            <div className='w-full min-h-screen bg-slate-50 flex items-center justify-center'>
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // --- No Profile Found (Debug View) ---
    if (!authorProfile && !loading) {
        return (
            <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Author not found</h1>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm max-w-md">
                    <strong>Debugging Info:</strong><br/>
                    {debugInfo}
                    <br/><br/>
                    <strong>Check your URL bar:</strong><br/>
                    It should look like: <code>/author/some_name</code><br/>
                    NOT like: <code>/author/65a8df...</code> (That is an ID, not a username)
                </div>
                <Link to="/" className="text-indigo-600 hover:underline mt-6 font-medium">Back to Home</Link>
            </div>
        );
    }

    const initials = authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';

    return (
        <div className='w-full min-h-screen bg-slate-50 py-12'>
            <Container>
                
                {/* --- PROFILE CARD --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                        
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-indigo-50">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1 pt-2">
                            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1">
                                {authorName}
                            </h1>
                            
                            {/* Username Display */}
                            <p className="text-slate-500 font-medium text-lg mb-3">
                                @{authorProfile.Username}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                                <span>Writer @ BlogApp</span>
                                <span className="hidden md:inline">&bull;</span>
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {posts.length} Articles Published
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="my-8 border-slate-100" />

                    {/* Bio */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center justify-center md:justify-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            About Me
                        </h3>
                        <div className="max-w-3xl text-slate-600 leading-relaxed whitespace-pre-wrap text-center md:text-left">
                            {authorProfile?.Bio ? authorProfile.Bio : (
                                <p className="italic text-slate-400">This author prefers to let their writing speak for itself.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- POSTS GRID --- */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800">Latest Articles</h2>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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