import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import appwriteService from '../appwrite/config';

function ProfilePictureManager() {
    const userData = useSelector((state) => state.auth.userData);
    const [fileId, setFileId] = useState(null);
    
    // UI States from your original code
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // 1. Fetch the Profile Picture ID on mount (From new UserProfiles Collection)
    useEffect(() => {
        if (userData) {
            appwriteService.getProfileImageFileId(userData.$id)
                .then((id) => {
                    setFileId(id);
                });
        }
    }, [userData]);

    // 2. Helper for Initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        
        if (parts.length >= 2) {
            
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        
        return name.charAt(0).toUpperCase();
    };

    // 3. Handle Upload (New Logic: UserProfiles Collection)
    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !userData) return;

        setUploadingAvatar(true);
        try {
            // A. Upload new file to bucket
            const uploadedFile = await appwriteService.uploadProfilePicture(file);
            
            if (uploadedFile) {
                // B. Link new file to user in DB
                await appwriteService.saveProfileImageId(userData.$id, uploadedFile.$id);
                
                // C. Delete old file from bucket (Cleanup)
                if (fileId) {
                    await appwriteService.deleteFile(fileId);
                }

                // D. Update local state
                setFileId(uploadedFile.$id);
                setIsAvatarModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert("Failed to update profile picture.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // 4. Handle Removal
    const handleRemoveProfilePic = async () => {
        if (!fileId || !userData) return;

        setUploadingAvatar(true);
        try {
            // A. Delete from bucket
            await appwriteService.deleteFile(fileId);

            // B. Remove link in DB (Save as null)
            await appwriteService.saveProfileImageId(userData.$id, null);

            // C. Update local state
            setFileId(null);
            setIsAvatarModalOpen(false);
        } catch (error) {
            console.error("Error removing avatar:", error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <>
            {/* ------------------------------------------------------- */}
            {/* 1. THE TRIGGER (AVATAR CIRCLE) - Kept your exact design */}
            {/* ------------------------------------------------------- */}
            <div 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
                {fileId ? (
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

                {/* Hover Overlay with Pencil */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* 2. THE MODAL (POPUP) - Kept your exact design           */}
            {/* ------------------------------------------------------- */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsAvatarModalOpen(false)}
                    ></div>

                    {/* Modal Card */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 overflow-hidden">
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsAvatarModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Profile Photo</h3>
                            <p className="text-sm text-slate-500 mb-6">Update or remove your avatar</p>

                            {/* Large Preview */}
                            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-inner border-4 border-slate-50 mb-8 relative group bg-slate-100">
                                {uploadingAvatar ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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

                            {/* Actions */}
                            <div className="space-y-3">
                                {/* Upload Button */}
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        onChange={handleProfilePicUpload} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/png, image/jpg, image/jpeg"
                                        disabled={uploadingAvatar}
                                    />
                                    <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        Upload New Photo
                                    </button>
                                </div>

                                {/* Remove Button */}
                                {fileId && (
                                    <button 
                                        onClick={handleRemoveProfilePic}
                                        disabled={uploadingAvatar}
                                        className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Remove Photo
                                    </button>
                                )}
                                
                                {/* Cancel */}
                                <button 
                                    onClick={() => setIsAvatarModalOpen(false)}
                                    className="text-slate-400 text-sm hover:text-slate-600 font-medium py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePictureManager;