import React, { useEffect, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Button, Input, Select, RTE } from '../index.js';
import appwriteService from '../../appwrite/config.js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PostForm({ post }) {
    // 1. SETUP: Default values matching Database Capitalization
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
    const watchedImage = watch("image");
    const userData = useSelector((state) => state.auth.userData);

    // 2. SUBMIT LOGIC (Bug-free version)
    const submit = async (data) => {
        setError("");
        if(data.status) data.status = data.status.toLowerCase();

        try {
            if (post) {
                // UPDATE Logic
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
                // CREATE Logic
                if (!data.image || !data.image[0]) {
                    setError("Please upload a featured image");
                    return;
                }

                const file = await appwriteService.uploadFile(data.image[0]);

                if (file) {
                    const fileId = file.$id;
                    data.featuredImage = fileId;
                    
                    const dbPost = await appwriteService.createPost({
                        ...data,
                        userId: userData.$id,
                    });

                    if (dbPost) {
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            }
        } catch (error) {
            console.log("PostForm Submit Error:", error);
            setError(error.message || "An error occurred while submitting the post.");
        }
    };

    // 3. SLUG TRANSFORM (Auto-generate slug)
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
        <form onSubmit={handleSubmit(submit)} className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
            
            {/* Error Toast */}
            {error && (
                <div className='col-span-3'>
                    <div className='bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200 flex items-center gap-2'>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className='font-medium text-sm'>{error}</span>
                    </div>
                </div>
            )}

            {/* LEFT COLUMN: Main Editor (White Card Style) */}
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

            {/* RIGHT COLUMN: Settings Sidebar (White Card Style) */}
            <div className='lg:col-span-1'>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-8">
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
                        
                        {/* Preview Existing Image */}
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

                        {/* Upload Box */}
                        <div className='relative'>
                            <input
                                type="file"
                                accept="image/*"
                                {...register('image', { required: !post })}
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

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            className={`w-full py-3 text-sm font-bold uppercase tracking-wide shadow-lg transform transition-all active:scale-[0.98] 
                                ${post ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
                            `}
                        >
                            {post ? 'Update Changes' : 'Publish Article'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PostForm;