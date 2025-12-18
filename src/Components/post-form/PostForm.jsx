import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { Button, Input, Select, RTE } from '../index.js';
import appwriteService from '../../appwrite/config.js';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { compressImage } from '../../utils/compressImage';
import { addPost, updatePost } from '../../Store/postSlice';
import { addUserPost, updateUserPost } from '../../Store/dashboardSlice';
import { updateTrendingPost } from '../../Store/homeSlice';
import ImageCropper from '../ImageCropper.jsx';

function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues, reset } = useForm({
        defaultValues: {
            title: post?.Title || '',
            slug: post?.$id || '',
            content: post?.Content || '',
            status: post?.Status || 'active',
        }
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(post ? appwriteService.getFileView(post.featuredImage) : null);
    const [selectedFile, setSelectedFile] = useState(null);

    // 🚨 NEW: Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const isLoading = useMemo(() => isInitializing || submitting, [isInitializing, submitting]);
    const isEditMode = useMemo(() => !!post, [post]);

    // Initialize component and preload image
    useEffect(() => {
        const init = async () => {
            if (post?.featuredImage) {
                const img = new Image();
                img.src = appwriteService.getFileView(post.featuredImage);
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsInitializing(false);
        };
        init();
    }, [post]);

    // Lock scroll when loading or submitting
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isLoading]);

    // Restore draft from localStorage (only for new posts)
    useEffect(() => {
        if (!post) {
            const savedDraft = localStorage.getItem("blog-post-draft");
            if (savedDraft) {
                try {
                    const parsedDraft = JSON.parse(savedDraft);
                    reset({
                        title: parsedDraft.title || "",
                        slug: parsedDraft.slug || "",
                        content: parsedDraft.content || "",
                        status: parsedDraft.status || "active",
                    });
                } catch (error) {
                    console.error("Error parsing draft:", error);
                }
            }
        }
    }, [post, reset]);

    // Save draft to localStorage on changes (only for new posts)
    useEffect(() => {
        if (!post) {
            const subscription = watch((value) => {
                localStorage.setItem("blog-post-draft", JSON.stringify(value));
            });
            return () => subscription.unsubscribe();
        }
    }, [watch, post]);

    // 🚨 UPDATED: Handle image file selection (Opens Cropper)
    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setTempImage(reader.result);
                setIsCropperOpen(true);
            };
            // Reset input value to allow re-selecting same file if needed
            e.target.value = null; 
        }
    }, []);

    // 🚨 NEW: Handle Crop Completion
    const handleCropDone = useCallback((croppedBlob) => {
        setIsCropperOpen(false);
        
        // Convert Blob to File
        // Note: Title/Type doesn't strictly matter here as compressImage will rename/retype it later
        const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
        
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    // Convert title to URL-friendly slug
    const slugTransform = useCallback((value) => {
        if (value && typeof value === 'string') {
            return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        }
        return '';
    }, []);

    // Form submission handler
    const submit = useCallback(async (data) => {
        setError("");
        setSubmitting(true);

        try {
            if (data.status) data.status = data.status.toLowerCase();
            
            let fileId = post ? undefined : null;
            
            // Handle image upload if new file selected
            if (selectedFile) {
                // compressImage logic remains exactly the same as you had it
                const compressed = await compressImage(selectedFile, 'post', data.title, userData.name);
                const file = await appwriteService.uploadFile(compressed);
                
                if (file) {
                    fileId = file.$id;
                    if (post?.featuredImage) {
                        await appwriteService.deleteFile(post.featuredImage);
                    }
                }
            }

            if (post) {
                // Update existing post
                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: fileId || undefined, 
                });
                
                if (dbPost) {
                    if (dbPost.Status === 'active') {
                        dispatch(updatePost(dbPost));
                        dispatch(updateTrendingPost(dbPost));
                    }
                    dispatch(updateUserPost(dbPost));
                    localStorage.removeItem("blog-post-draft");
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                // Create new post
                if (!fileId) throw new Error("⚠️ Please upload a featured image!");

                data.featuredImage = fileId;
                const dbPost = await appwriteService.createPost({
                    ...data,
                    userId: userData.$id,
                    AuthorName: userData.name || 'Guest Author',
                });
                
                if (dbPost) {
                    if (dbPost.Status === 'active') {
                        dispatch(addPost(dbPost));
                    }
                    dispatch(addUserPost(dbPost));
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
    }, [post, selectedFile, userData, dispatch, navigate]);

    // Auto-generate slug from title
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'title') {
                setValue('slug', slugTransform(value.title), { shouldValidate: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    // Auto-dismiss error after 4 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSlugInput = useCallback((e) => {
        setValue('slug', slugTransform(e.currentTarget.value), { shouldValidate: true });
    }, [setValue, slugTransform]);

    return (
        <>
            {/* 🚨 NEW: Image Cropper Portal */}
            {isCropperOpen && (
                <ImageCropper 
                    imageSrc={tempImage}
                    onCropComplete={handleCropDone}
                    onCancel={() => setIsCropperOpen(false)}
                    aspect={16 / 9}
                    cropShape="rect"
                    title="Crop Blog Header"
                />
            )}

            {/* Loading overlay */}
            {isLoading && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div 
                        className="relative flex flex-col items-center"
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        <div className="relative flex h-20 w-20 mb-6">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
                          <span className="relative inline-flex rounded-full h-20 w-20 bg-indigo-600 shadow-xl shadow-indigo-500/30 items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-wide uppercase animate-pulse">
                            {isInitializing ? 'Loading Editor' : (isEditMode ? 'Updating Post' : 'Publishing')}
                        </h3>
                        <p className="text-indigo-200 text-sm mt-2 font-medium">Please wait a moment...</p>
                    </div>
                </div>,
                document.body
            )}

            <form onSubmit={handleSubmit(submit)} className="flex flex-col lg:grid lg:grid-cols-3 gap-8 relative lg:items-start">
                
                {/* Error notification toast */}
                {error && (
                    <div className='fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none'>
                        <div className='bg-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-rose-500 animate-bounce flex items-center gap-4'>
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className='font-bold text-sm'>{error}</span>
                        </div>
                    </div>
                )}

                {/* Content editor section */}
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
                                onInput={handleSlugInput}
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

                {/* Publishing settings sidebar */}
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

                        {/* Featured image upload - Aspect video, no stretching */}
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
                                    className={`flex items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
                                        ${previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-white'}
                                    `}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full group">
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="w-full h-full object-contain bg-slate-100"
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold uppercase tracking-wide">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
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
                                    ${isEditMode ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
                                    ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
                                `}
                            >
                                {isEditMode ? 'Update Changes' : 'Publish Article'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default PostForm;