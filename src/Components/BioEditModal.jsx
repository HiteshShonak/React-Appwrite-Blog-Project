import React, { useState, useEffect } from 'react';
import appwriteService from '../appwrite/config';

function BioEditModal({ isOpen, onClose, initialBio, userData, onBioSaved }) {
    const [bioInput, setBioInput] = useState(initialBio || "");
    const [saving, setSaving] = useState(false);

    // Update local state when the modal opens or initialBio changes
    useEffect(() => {
        setBioInput(initialBio || "");
    }, [initialBio, isOpen]);

    const handleSave = async () => {
        if (!userData) return;
        setSaving(true);
        
        try {
            // Call Appwrite Service
            await appwriteService.updateUserProfile(userData.$id, {
                Bio: bioInput 
            });
            
            // Notify Parent (Dashboard) and Close
            if (onBioSaved) onBioSaved(bioInput);
            onClose();
        } catch (error) {
            console.error("Error saving bio:", error);
            alert("Failed to save bio.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                {/* Close X Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">Update Bio</h3>
                <p className="text-sm text-slate-500 mb-6 text-center">Tell your readers about yourself</p>
                
                <div className="mb-6">
                    <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-base"
                        rows="5"
                        placeholder="I am a writer who loves..."
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        maxLength={300}
                        disabled={saving}
                    ></textarea>
                    <div className="text-right text-xs text-slate-400 mt-1">{bioInput.length}/300</div>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : 'Save Bio'}
                </button>
            </div>
        </div>
    );
}

export default BioEditModal;