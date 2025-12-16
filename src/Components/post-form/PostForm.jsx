import React, { useEffect, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Button, Input, Select, RTE } from '../index.js';
import appwriteService from '../../appwrite/config.js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post ? post.Title : '',
            slug: post ? post.$id : '',
            content: post ? post.Content : '',
            status: post ? post.Status : 'active',
        }
    });

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const watchedImage = watch("image");
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        setError("");
        setLoading(true);

        if(data.status) data.status = data.status.toLowerCase();

        try {
            if (post) {
                const file = data.image && data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

                if (file) {
                    appwriteService.deleteFile(post.featuredImage);
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file ? file.$id : undefined,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                if (!data.image || !data.image[0]) {
                    setError("⚠️ Please upload a featured image!");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setLoading(false);
                    return;
                }

                const file = await appwriteService.uploadFile(data.image[0]);

                if (file) {
                    const fileId = file.$id;
                    data.featuredImage = fileId;
                    
                    const dbPost = await appwriteService.createPost({
                        ...data,
                        userId: userData.$id,
                        AuthorName: userData.name || 'Guest Author',
                    });

                    if (dbPost) {
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            }
        } catch (error) {
            console.log("PostForm Submit Error:", error);
            setError(error.message || "An error occurred while submitting the post.");
            setLoading(false);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === 'string') {
            return value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        return '';
    }, [])

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'title') {
                const slug = slugTransform(value.title);
                setValue('slug', slug, { shouldValidate: true });
            }
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [watch, slugTransform, setValue]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <>
            {/* ------------------------------------------------------- */}
            {/* 🚨 FULL SCREEN LOADING OVERLAY (Dimmed Background)       */}
            {/* ------------------------------------------------------- */}
            {/* ------------------------------------------------------- */}
            {/* STYLE 1: MODERN PULSE LOADER                             */}
            {/* ------------------------------------------------------- */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md transition-all">
                    <div className="relative flex flex-col items-center">
                        
                        {/* Pulsing Icon */}
                        <div className="relative flex h-20 w-20 mb-6">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
                          <span className="relative inline-flex rounded-full h-20 w-20 bg-indigo-600 shadow-xl shadow-indigo-500/30 items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </span>
                        </div>
                        
                        {/* Text */}
                        <h3 className="text-2xl font-black text-white tracking-wide uppercase animate-pulse">
                            {post ? 'Updating' : 'Publishing'}
                        </h3>
                        <p className="text-indigo-200 text-sm mt-2 font-medium">Do not close this window</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(submit)} className="flex flex-col lg:grid lg:grid-cols-3 gap-8 relative lg:items-start">
                
                {/* Error Toast */}
                {error && (
                    <div className='fixed top-40 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none'>
                        <div className='bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce flex items-center justify-center gap-3'>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className='font-bold text-sm'>{error}</span>
                        </div>
                    </div>
                )}

                {/* LEFT COLUMN: Main Editor */}
                <div className='lg:col-span-2'>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                        <div className="border-b border-slate-100 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Content Details</h2>
                            <p className="text-sm text-slate-500">Write your masterpiece below.</p>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="Article Title"
                                type="text"
                                placeholder="Enter a catchy title..."
                                {...register('title', { required: 'Title is required' })}
                                className="text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                            
                            <Input
                                label="Slug (URL)"
                                type="text"
                                placeholder="post-slug-url"
                                {...register('slug', { required: 'Slug is required' })}
                                onInput={(e) => {
                                    setValue('slug', slugTransform(e.currentTarget.value), { shouldValidate: true });
                                }}
                                className="font-mono text-sm text-slate-600 bg-slate-50 border-slate-200"
                            />
                            
                            <div className="pt-2">
                                <RTE
                                    name="content"
                                    control={control}
                                    label="Content Body"
                                    defaultValue={getValues('content')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Settings Sidebar */}
                <div className='lg:col-span-1'>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Publishing</h2>
                            <p className="text-sm text-slate-500">Manage visibility and media.</p>
                        </div>

                        {/* Status Select */}
                        <div>
                            <Select
                                label="Status"
                                options={['active', 'draft']}
                                {...register('status', { required: 'Status is required' })}
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>

                        {/* Image Uploader */}
                        <div className="space-y-2">
                            <label className="inline-block text-sm font-medium text-slate-700">Featured Image</label>
                            
                            {post && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 mb-3 group shadow-sm">
                                    <img 
                                        src={appwriteService.getFileView(post.featuredImage)} 
                                        alt={post.Title} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Current Cover</span>
                                    </div>
                                </div>
                            )}

                            <div className='relative'>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register('image', { required: false })}
                                    className="hidden"
                                    id="featuredImage"
                                />
                                <label
                                    htmlFor="featuredImage"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 bg-slate-50
                                        ${watchedImage && watchedImage.length > 0 ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-white'}
                                    `}
                                >
                                    {watchedImage && watchedImage.length > 0 ? (
                                        <div className="text-center px-4 w-full">
                                            <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className='text-xs text-blue-700 font-semibold block truncate'>{watchedImage[0].name}</span>
                                            <span className="text-[10px] text-blue-500 uppercase tracking-wide">Click to change</span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className='text-sm text-slate-500 font-medium block'>Upload Image</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button (Just disabled now, loader is on screen) */}
                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                disabled={loading} 
                                className={`w-full py-3 text-sm font-bold uppercase tracking-wide shadow-lg transform transition-all 
                                    ${post ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
                                    ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
                                `}
                            >
                                {post ? 'Update Changes' : 'Publish Article'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default PostForm;