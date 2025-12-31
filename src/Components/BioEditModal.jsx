import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import appwriteService from '../appwrite/config';

function BioEditModal({ isOpen, onClose, initialBio, userData, onBioSaved }) {
    const [bioInput, setBioInput] = useState(initialBio || "");
    const [saving, setSaving] = useState(false);
    
    const isMountedRef = useRef(true);
    const textareaRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setBioInput(initialBio || "");
        }
    }, [initialBio, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            previousFocusRef.current = document.activeElement;
            
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
            
            if (previousFocusRef.current) {
                previousFocusRef.current?.focus();
                previousFocusRef.current = null;
            }
        }
        
        return () => { 
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && !saving) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, saving]);

    const handleClose = useCallback(() => {
        if (saving) return;
        onClose();
    }, [saving, onClose]);

    const handleSave = useCallback(async () => {
        if (!userData || !isMountedRef.current) return;
        
        setSaving(true);
        
        try {
            await appwriteService.updateUserProfile(userData.$id, { Bio: bioInput });
            
            if (!isMountedRef.current) return;
            
            if (onBioSaved) onBioSaved(bioInput);
            onClose();
        } catch (error) {
            if (!isMountedRef.current) return;
            
            console.error("Error saving bio:", error);
            alert("Failed to save bio. Please try again.");
        } finally {
            if (isMountedRef.current) {
                setSaving(false);
            }
        }
    }, [userData, bioInput, onBioSaved, onClose]);

    const handleBioChange = useCallback((e) => {
        setBioInput(e.target.value);
    }, []);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 modal-backdrop-instant-blur"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bio-modal-title"
        >
            <div 
                className="gpu-accelerate absolute inset-0" 
                onClick={handleClose}
            />

            <div 
                className="gpu-accelerate relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-slate-100 modal-scale-animation"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={handleClose}
                    disabled={saving}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close modal"
                    type="button"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h3 
                    id="bio-modal-title"
                    className="text-xl font-bold text-slate-900 mb-1 text-center"
                >
                    Update Bio
                </h3>
                <p className="text-sm text-slate-500 mb-6 text-center">Tell your readers about yourself</p>
                
                <div className="mb-6">
                    <label htmlFor="bio-textarea" className="sr-only">Your bio</label>
                    <textarea
                        id="bio-textarea"
                        ref={textareaRef}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        rows="5"
                        placeholder="I am a writer who loves..."
                        value={bioInput}
                        onChange={handleBioChange}
                        maxLength={300}
                        disabled={saving}
                        aria-describedby="bio-char-count"
                    />
                    <div 
                        id="bio-char-count"
                        className="text-right text-xs text-slate-400 mt-1"
                        aria-live="polite"
                    >
                        {bioInput.length}/300
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleClose}
                        disabled={saving}
                        className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        aria-label="Cancel without saving"
                    >
                        Cancel
                    </button>
                    
                    <button 
                        onClick={handleSave} 
                        disabled={saving || bioInput === initialBio}
                        className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        aria-label="Save bio"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                Saving...
                            </>
                        ) : 'Save Bio'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default BioEditModal;
