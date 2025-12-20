import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import appwriteService from '../appwrite/config';
import { compressImage } from '../utils/compressImage';
import AvatarCropper from './ImageCropper';
import { parseErrorMessage } from '../utils/errorUtils';

// ✅ OPTIMIZATION 1: Move outside component (not recreated on every render)
const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
};

function ProfilePictureManager({ onProfileUpdate, initialFileId }) {
    const userData = useSelector((state) => state.auth.userData);
    
    const [fileId, setFileId] = useState(initialFileId || null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
    const [error, setError] = useState(""); // ✅ NEW: Error banner state
    const [loadingFileId, setLoadingFileId] = useState(false); // ✅ NEW: Loading state
    
    const fileReaderRef = useRef(null); // ✅ FIX 3: Track FileReader for cleanup

    // ✅ FIX 4: Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Sync prop changes to local state
    useEffect(() => {
        if (initialFileId !== undefined) {
            setFileId(initialFileId);
        }
    }, [initialFileId]);

    // ✅ FIX 1: Fetch fileId with error handling
    useEffect(() => {
        if (userData && initialFileId === undefined) {
            setLoadingFileId(true);
            appwriteService.getProfileImageFileId(userData.$id)
                .then(setFileId)
                .catch((err) => {
                    console.error('Error fetching profile image:', err);
                    setFileId(null); // Fallback to initials
                })
                .finally(() => setLoadingFileId(false));
        }
    }, [userData, initialFileId]);

    // ✅ FIX 2: Scroll lock WITH scrollbar compensation
    useEffect(() => {
        if (isAvatarModalOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => { 
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isAvatarModalOpen]);

    // ✅ FIX 3: Cleanup FileReader on unmount
    useEffect(() => {
        return () => {
            if (fileReaderRef.current) {
                fileReaderRef.current.abort();
            }
        };
    }, []);

    // ✅ OPTIMIZATION 2: Memoized file select handler
    const onFileSelect = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // ✅ FIX 5: Use error banner instead of alert
            if (file.size > 10 * 1024 * 1024) {
                setError("Image is too large. Please use an image under 10MB.");
                e.target.value = null;
                return;
            }

            const reader = new FileReader();
            fileReaderRef.current = reader; // Track for cleanup
            
            reader.addEventListener('load', () => {
                setSelectedImageForCrop(reader.result);
                fileReaderRef.current = null;
            });
            
            reader.addEventListener('error', () => {
                setError("Failed to read image file. Please try again.");
                fileReaderRef.current = null;
            });
            
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    }, []);

    // ✅ OPTIMIZATION 3: Memoized crop complete handler
    const onCropComplete = useCallback(async (croppedFile) => {
        setSelectedImageForCrop(null);
        setUploadingAvatar(true);
        setError(""); // Clear any previous errors

        try {
            const compressedFile = await compressImage(croppedFile, 'avatar', userData.name);
            const uploadedFile = await appwriteService.uploadProfilePicture(compressedFile);
            
            if (uploadedFile) {
                await appwriteService.saveProfileImageId(userData.$id, uploadedFile.$id);
                
                // Delete old avatar if exists
                if (fileId) {
                    await appwriteService.deleteFile(fileId).catch(err => {
                        console.error('Error deleting old avatar:', err);
                        // Don't fail the whole operation if old file delete fails
                    });
                }

                setFileId(uploadedFile.$id);
                setIsAvatarModalOpen(false);
                if (onProfileUpdate) onProfileUpdate();
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
            setError(parseErrorMessage(error));
        } finally {
            setUploadingAvatar(false);
        }
    }, [fileId, userData, onProfileUpdate]);

    // ✅ OPTIMIZATION 4: Memoized remove handler
    const handleRemoveProfilePic = useCallback(async () => {
        if (!fileId || !userData) return;
        
        setUploadingAvatar(true);
        setError(""); // Clear any previous errors
        
        try {
            await appwriteService.deleteFile(fileId);
            await appwriteService.saveProfileImageId(userData.$id, null);
            setFileId(null);
            setIsAvatarModalOpen(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            console.error("Error removing avatar:", error);
            setError(parseErrorMessage(error));
        } finally {
            setUploadingAvatar(false);
        }
    }, [fileId, userData, onProfileUpdate]);

    // ✅ OPTIMIZATION 5: Memoized modal close
    const closeModal = useCallback(() => {
        if (!uploadingAvatar) {
            setIsAvatarModalOpen(false);
        }
    }, [uploadingAvatar]);

    // ✅ OPTIMIZATION 6: Memoized cancel crop
    const cancelCrop = useCallback(() => {
        setSelectedImageForCrop(null);
        if (fileReaderRef.current) {
            fileReaderRef.current.abort();
            fileReaderRef.current = null;
        }
    }, []);

    return (
        <>
            {/* ✅ NEW: Error Banner */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10000 w-full max-w-md px-4">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 flex items-center gap-3 animate-bounce">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="font-semibold text-sm">{error}</p>
                        <button 
                            onClick={() => setError("")}
                            className="ml-auto text-white hover:text-red-100"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Avatar cropper modal */}
            {selectedImageForCrop && (
                <AvatarCropper 
                    imageSrc={selectedImageForCrop}
                    onCancel={cancelCrop}
                    onCropComplete={onCropComplete}
                />
            )}

            {/* Avatar display with edit trigger */}
            <div 
                onClick={() => setIsAvatarModalOpen(true)}
                className="interactive gpu-accelerate relative group w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
                {loadingFileId ? (
                    // ✅ NEW: Loading state while fetching fileId
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : fileId ? (
                    <img 
                        src={appwriteService.getAvatarPreview(fileId)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                        {getInitials(userData?.name)}
                    </div>
                )}
                <div className="gpu-accelerate absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            </div>

            {/* Profile picture management modal */}
            {isAvatarModalOpen && !selectedImageForCrop && createPortal(
                <div 
                    className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 modal-backdrop-instant-blur"
                >
                    <div 
                        className="gpu-accelerate absolute inset-0"
                        onClick={closeModal}
                    />

                    <div 
                        className="gpu-accelerate relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 overflow-hidden modal-scale-animation"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={closeModal}
                            disabled={uploadingAvatar}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close modal"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Profile Photo</h3>
                            <p className="text-sm text-slate-500 mb-6">Update or remove your avatar</p>

                            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-inner border-4 border-slate-50 mb-8 relative group bg-slate-100">
                                {uploadingAvatar ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : fileId ? (
                                    <img 
                                        src={appwriteService.getAvatarPreview(fileId)} 
                                        alt="Current Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-5xl font-bold tracking-wider">
                                        {getInitials(userData?.name)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        onChange={onFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/png, image/jpg, image/jpeg, image/webp" 
                                        disabled={uploadingAvatar}
                                        aria-label="Upload new photo"
                                    />
                                    <button 
                                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={uploadingAvatar}
                                        type="button"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Upload New Photo
                                    </button>
                                </div>

                                {fileId && (
                                    <button 
                                        onClick={handleRemoveProfilePic}
                                        disabled={uploadingAvatar}
                                        className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="button"
                                        aria-label="Remove photo"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove Photo
                                    </button>
                                )}
                                
                                <button 
                                    onClick={closeModal}
                                    disabled={uploadingAvatar}
                                    className="text-slate-400 text-sm hover:text-slate-600 font-medium py-2 disabled:opacity-50"
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default ProfilePictureManager;