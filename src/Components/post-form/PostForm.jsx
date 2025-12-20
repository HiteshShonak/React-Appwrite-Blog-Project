import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { Button, Input, Select, RTE } from '../index.js';
import appwriteService from '../../appwrite/config.js';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { compressImage } from '../../utils/compressImage';
import { parseErrorMessage } from '../../utils/errorUtils'; 
import { addPost, updatePost } from '../../Store/postSlice';
import { addUserPost, updateUserPost } from '../../Store/dashboardSlice';
import { updateTrendingPost } from '../../Store/homeSlice';
import ImageCropper from '../ImageCropper.jsx';
import { EditorLoader } from '../Skeletons.jsx';

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
    
    // 🚨 INSTANT LOADER: Start true so it appears immediately
    const [isInitializing, setIsInitializing] = useState(true);
    
    const [previewUrl, setPreviewUrl] = useState(post ? appwriteService.getFileView(post.featuredImage) : null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const isLoading = useMemo(() => isInitializing || submitting, [isInitializing, submitting]);
    const isEditMode = useMemo(() => !!post, [post]);

    // Initialize component (With Minimum "Premium" Wait Time)
    useEffect(() => {
        const init = async () => {
            const tasks = [];

            // 1. 🚨 OPTIMIZED WAIT TIME: 
            // Reduced to 300ms. Fast enough to feel "instant", 
            // but long enough to show the nice animation without flickering.
            tasks.push(new Promise(resolve => setTimeout(resolve, 300)));

            // 2. Preload Image (if exists)
            if (post?.featuredImage) {
                const img = new Image();
                img.src = appwriteService.getFileView(post.featuredImage);
                tasks.push(new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Proceed even if image fails
                }));
            }

            // Wait for both time + image
            await Promise.all(tasks);
            setIsInitializing(false);
        };
        init();
    }, [post]);

    // Lock scroll when loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isLoading]);

    // Restore draft logic
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

    // Save draft logic
    useEffect(() => {
        if (!post) {
            const subscription = watch((value) => {
                localStorage.setItem("blog-post-draft", JSON.stringify(value));
            });
            return () => subscription.unsubscribe();
        }
    }, [watch, post]);

    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Validation: Size 10MB
            if (file.size > 10 * 1024 * 1024) {
                setError("File size too large. Please upload an image under 10MB.");
                e.target.value = null; 
                return;
            }

            // Validation: Type
            if (!file.type.startsWith("image/")) {
                setError("Invalid file type. Please upload a valid image (JPG, PNG, WebP).");
                e.target.value = null;
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setTempImage(reader.result);
                setIsCropperOpen(true);
            };
            e.target.value = null; 
        }
    }, []);

    const handleCropDone = useCallback(async (croppedBlob) => {
        setIsCropperOpen(false);
        try {
            const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
            const compressed = await compressImage(file, 'post', getValues('title') || 'post', userData.name);
            
            setSelectedFile(compressed);
            setPreviewUrl(URL.createObjectURL(compressed));
        } catch (error) {
            console.error("Image processing failed:", error);
            setError("Failed to process image.");
        }
    }, [getValues, userData]);

    const slugTransform = useCallback((value) => {
        if (value && typeof value === 'string') {
            return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 30);
        }
        return '';
    }, []);

    const submit = useCallback(async (data) => {
        setError("");
        setSubmitting(true);

        try {
            if (data.status) data.status = data.status.toLowerCase();
            let fileId = post ? undefined : null;
            
            if (selectedFile) {
                const file = await appwriteService.uploadFile(selectedFile);
                if (file) {
                    fileId = file.$id;
                    if (post?.featuredImage) {
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
                    if (dbPost.Status === 'active') {
                        dispatch(updatePost(dbPost));
                        dispatch(updateTrendingPost(dbPost));
                    }
                    dispatch(updateUserPost(dbPost));
                    localStorage.removeItem("blog-post-draft");
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
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
            setError(parseErrorMessage(error));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    }, [post, selectedFile, userData, dispatch, navigate]);

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
            const timer = setTimeout(() => setError(""), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSlugInput = useCallback((e) => {
        setValue('slug', slugTransform(e.currentTarget.value), { shouldValidate: true });
    }, [setValue, slugTransform]);

    return (
        <>
            {isCropperOpen && (
                <ImageCropper 
                    imageSrc={tempImage}
                    onCropComplete={handleCropDone}
                    onCancel={() => setIsCropperOpen(false)}
                    aspect={16 / 9}
                    cropShape="rect"
                    title="Crop Blog Header"
                    className="max-w-2xl!"
                />
            )}

            {/* 🚨 MODERN SAAS LOADER */}
            {isLoading && createPortal(
                EditorLoader(),
                document.body
            )}

            <form onSubmit={handleSubmit(submit)} className="flex flex-col lg:grid lg:grid-cols-3 gap-8 relative lg:items-start">
                
                {/* Error notification */}
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