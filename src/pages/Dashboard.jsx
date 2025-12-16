import React, { useState, useEffect, useCallback } from 'react';
import appwriteService from '../appwrite/config.js';
import { Container, PostCard, LogoutBtn } from '../Components'; 
import { useSelector } from 'react-redux'; 
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import ProfilePictureManager from '../Components/ProfilePictureManager';
import BioEditModal from '../Components/BioEditModal';

function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [userBio, setUserBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);

    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);

    const fetchData = useCallback(() => {
        if (authStatus && userData) {
            const postsPromise = appwriteService.getPosts([Query.equal("UserId", userData.$id)]);
            const profilePromise = appwriteService.getUserProfile(userData.$id);

            Promise.all([postsPromise, profilePromise])
                .then(([postsRes, profileRes]) => {
                    if (postsRes) setPosts(postsRes.documents);
                    if (profileRes && profileRes.Bio) {
                        setUserBio(profileRes.Bio);
                    } else {
                        setUserBio("");
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [authStatus, userData]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openBioModal = () => setIsBioModalOpen(true);
    const handleBioSaved = (newBio) => setUserBio(newBio);

    if (!authStatus) return <div className='w-full min-h-screen bg-slate-50 flex items-center justify-center'>Guest View</div>;
    if (loading) return <div className='w-full min-h-screen bg-slate-50 flex items-center justify-center'><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;

    const draftPosts = posts.filter((post) => post.Status === 'draft');
    const activePosts = posts.filter((post) => post.Status === 'active');

    return (
        <div className='w-full min-h-screen bg-slate-50 py-8 relative'>
            
            <BioEditModal 
                isOpen={isBioModalOpen}
                onClose={() => setIsBioModalOpen(false)}
                initialBio={userBio || `Hi! My name is ${userData?.name || 'Writer'}.`}
                userData={userData}
                onBioSaved={handleBioSaved}
            />

            <Container>
                {/* IDENTITY SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* LEFT: Avatar & Name */}
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="shrink-0">
                            <ProfilePictureManager onProfileUpdate={fetchData} />
                        </div>
                        <div className="min-w-0"> 
                            <h1 className='text-xl font-bold text-slate-900 truncate'>
                                {userData?.name || 'Writer'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Welcome back.
                            </p>
                        </div>
                    </div>
                    
                    {/* RIGHT: Actions (Edit Bio + Logout) */}
                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                        
                        {/* 🚨 MOVED HERE: Edit Bio Button */}
                        <button 
                            onClick={openBioModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit Bio
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

                        <LogoutBtn className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-all" />
                    </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
                    </div>
                    <Link to="/add-post" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        Create New Post
                    </Link>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Posts</p>
                            <h3 className="text-2xl font-bold text-slate-800">{posts.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Published</p>
                            <h3 className="text-2xl font-bold text-slate-800">{activePosts.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Drafts</p>
                            <h3 className="text-2xl font-bold text-slate-800">{draftPosts.length}</h3>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTIONS */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Your Drafts
                        </h2>
                        {draftPosts.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center border border-slate-200 border-dashed">
                                <p className="text-slate-500">You don't have any drafts right now.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {draftPosts.map((post) => (
                                    <div key={post.$id} className="relative group">
                                        <div className="absolute top-3 left-3 z-10 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded shadow-sm">DRAFT</div>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Published Articles
                        </h2>
                        {activePosts.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center border border-slate-200 border-dashed">
                                <p className="text-slate-500">You haven't published anything yet.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {activePosts.map((post) => (
                                    <div key={post.$id}>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Dashboard;