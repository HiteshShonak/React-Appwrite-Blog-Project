import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, RTE } from '../index.js';
import appwriteService from '../../appwrite/config.js';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { compressImage } from '../../utils/compressImage';
// 🚨 IMPORTS: Import actions for ALL slices
import { addPost, updatePost } from '../../Store/postSlice';
import { addUserPost, updateUserPost } from '../../Store/dashboardSlice';
// 🚨 NEW IMPORT: Sync with Home Page Trending
import { updateTrendingPost } from '../../Store/homeSlice';

function PostForm({ post }) {
    // 🚨 Added 'reset' to destructuring to restore drafts
    const { register, handleSubmit, watch, setValue, control, getValues, reset } = useForm({
        defaultValues: {
            title: post ? post.Title : '',
            slug: post ? post.$id : '',
            content: post ? post.Content : '',
            status: post ? post.Status : 'active',
        }
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isPageReady, setIsPageReady] = useState(false);
    
    const [previewUrl, setPreviewUrl] = useState(post ? appwriteService.getFileView(post.featuredImage) : null);
    const [selectedFile, setSelectedFile] = useState(null);

    // 1. INITIALIZATION & IMAGE LOADING
    useEffect(() => {
        const initForm = async () => {
            const promises = [];
            if (post && post.featuredImage) {
                const imgPromise = new Promise((resolve) => {
                    const img = new Image();
                    img.src = appwriteService.getFileView(post.featuredImage);
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                promises.push(imgPromise);
            }
            promises.push(new Promise(resolve => setTimeout(resolve, 300)));
            await Promise.all(promises);
            setIsPageReady(true);
        };
        initForm();
    }, [post]);

    // 🚨 2. LOCAL STORAGE: RESTORE DRAFT
    // Only run if we are creating a NEW post (not editing)
    useEffect(() => {
        if (!post) {
            const savedDraft = localStorage.getItem("blog-post-draft");
            if (savedDraft) {
                const parsedDraft = JSON.parse(savedDraft);
                // Reset form with saved data
                reset({
                    title: parsedDraft.title || "",
                    slug: parsedDraft.slug || "",
                    content: parsedDraft.content || "",
                    status: parsedDraft.status || "active",
                });
            }
        }
    }, [post, reset]);

    // 🚨 3. LOCAL STORAGE: SAVE DRAFT
    // Watch for changes and save to local storage
    useEffect(() => {
        if (!post) {
            const subscription = watch((value) => {
                localStorage.setItem("blog-post-draft", JSON.stringify(value));
            });
            return () => subscription.unsubscribe();
        }
    }, [watch, post]);


    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const submit = async (data) => {
        setError("");
        setSubmitting(true);

        try {
            if (data.status) data.status = data.status.toLowerCase();
            
            let fileId = post ? undefined : null;
            
            if (selectedFile) {
                const compressed = await compressImage(selectedFile, 
                                                        'post', 
                                                        data.title,      
                                                        userData.name);    
                                                        
                const file = await appwriteService.uploadFile(compressed);
                
                if (file) {
                    fileId = file.$id;
                    if (post && post.featuredImage) {
                        await appwriteService.deleteFile(post.featuredImage);
                    }
                }
            }

            if (post) {
                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: fileId || undefined, 
                });
                
                if (dbPost) {
                    // 🚨 SYNC UPDATE:
                    
                    // 1. Update Public Feed (ONLY if Active)
                    if (dbPost.Status === 'active') {
                        dispatch(updatePost(dbPost));
                        // 🚨 2. Update Trending (Home Page) - If it happens to be trending
                        dispatch(updateTrendingPost(dbPost));
                    }
                    
                    // 3. Update Dashboard (ALWAYS - shows active & drafts)
                    dispatch(updateUserPost(dbPost));
                    
                    // 🚨 Clean up storage just in case
                    localStorage.removeItem("blog-post-draft");
                    navigate(`/post/${dbPost.$id}`);
                }
            } 
            else {
                if (!fileId) throw new Error("⚠️ Please upload a featured image!");

                data.featuredImage = fileId;
                const dbPost = await appwriteService.createPost({
                    ...data,
                    userId: userData.$id,
                    AuthorName: userData.name || 'Guest Author',
                });
                
                if (dbPost) {
                    // 🚨 SYNC CREATE:

                    // 1. Update Public Feed (ONLY if Active)
                    if (dbPost.Status === 'active') {
                        dispatch(addPost(dbPost));
                    }

                    // 2. Update Dashboard (ALWAYS)
                    dispatch(addUserPost(dbPost));

                    // 🚨 SUCCESS: Clear the draft
                    localStorage.removeItem("blog-post-draft");
                    navigate(`/post/${dbPost.$id}`);
                }
            }

        } catch (error) {
            console.error("PostForm Error:", error);
            setError(error.message || "Submission failed.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === 'string') {
            return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        }
        return '';
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'title') {
                setValue('slug', slugTransform(value.title), { shouldValidate: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const isLoading = !isPageReady || submitting;

    return (
        <>
            {/* LOADING OVERLAY */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-opacity duration-300">
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-20 w-20 mb-6">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
                          <span className="relative inline-flex rounded-full h-20 w-20 bg-indigo-600 shadow-xl shadow-indigo-500/30 items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-wide uppercase animate-pulse">
                            {!isPageReady ? 'Initializing Editor' : (post ? 'Updating Post' : 'Publishing')}
                        </h3>
                        <p className="text-indigo-200 text-sm mt-2 font-medium">Please wait a moment...</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(submit)} className={`flex flex-col lg:grid lg:grid-cols-3 gap-8 relative lg:items-start transition-opacity duration-500 ${!isPageReady ? 'opacity-0' : 'opacity-100'}`}>
                
                {/* Error Toast */}
                {error && (
                    <div className='fixed top-45 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none'>
                        <div className='bg-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-rose-500 animate-bounce flex items-center gap-4'>
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className='font-bold text-sm'>{error}</span>
                        </div>
                    </div>
                )}

                {/* LEFT: Editor */}
                <div className='lg:col-span-2'>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                        <div className="border-b border-slate-100 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Content Details</h2>
                            <p className="text-sm text-slate-500">Write your masterpiece below.</p>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="Article Title"
                                placeholder="Enter a catchy title..."
                                {...register('title', { required: 'Title is required' })}
                                className="text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                            
                            <Input
                                label="Slug (URL)"
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

                {/* RIGHT: Settings & Image */}
                <div className='lg:col-span-1'>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Publishing</h2>
                            <p className="text-sm text-slate-500">Manage visibility and media.</p>
                        </div>

                        <div>
                            <Select
                                label="Status"
                                options={['active', 'draft']}
                                {...register('status', { required: 'Status is required' })}
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>

                        {/* IMAGE UPLOAD SECTION */}
                        <div className="space-y-2">
                            <label className="inline-block text-sm font-medium text-slate-700">Featured Image</label>
                            
                            <div className='relative'>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="featuredImage"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="featuredImage"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 bg-slate-50 overflow-hidden
                                        ${previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-white'}
                                    `}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold uppercase">Change Image</span>
                                            </div>
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

                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                disabled={submitting} 
                                className={`w-full py-3 text-sm font-bold uppercase tracking-wide shadow-lg transform transition-all 
                                    ${post ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
                                    ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
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