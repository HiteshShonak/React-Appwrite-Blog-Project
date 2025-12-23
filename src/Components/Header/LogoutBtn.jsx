import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import authService from '../../appwrite/auth.js';
import { logout } from '../../Store/authSlice.js';
import { resetDashboard } from '../../Store/dashboardSlice.js';

const LogoutBtn = memo(({ className = "" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const isMountedRef = useRef(true);
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    // ✅ Add this to lock scroll when Modal OR Loader is active
    useEffect(() => {
        const shouldLock = showConfirmModal || isLoggingOut;
        document.body.style.overflow = shouldLock ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showConfirmModal, isLoggingOut]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!showConfirmModal) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showConfirmModal]);

    useEffect(() => {
        if (showConfirmModal) {
            previousFocusRef.current = document.activeElement;
            
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        } else if (previousFocusRef.current) {
            previousFocusRef.current?.focus();
            previousFocusRef.current = null;
        }
    }, [showConfirmModal]);

    const handleModalKeyDown = useCallback((e) => {
        if (e.key !== 'Tab') return;

        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }, []);

    const handleLogoutClick = useCallback(() => {
        setShowConfirmModal(true);
    }, []);

    const handleCancel = useCallback(() => {
        setShowConfirmModal(false);
    }, []);

    // ✅ UPDATED: Enhanced logout with proper localStorage cleanup
    const handleConfirmLogout = useCallback(async () => {
        setShowConfirmModal(false);
        setIsLoggingOut(true);

        try {
            await authService.logout();
            
            if (!isMountedRef.current) return;
            
            // ✅ Dispatch logout (clears authStatus + userData via authSlice)
            dispatch(logout()); 
            dispatch(resetDashboard()); 
            
            // ✅ Clear all app-specific cache from localStorage
            try {
                const keysToRemove = Object.keys(localStorage).filter(key => 
                    key.includes('cache') || 
                    key.includes('_posts') || 
                    key.includes('_profile') ||
                    key.includes('author_profile_') ||
                    key.includes('dashboard_') ||
                    key.includes('blog-post-draft')
                );
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // ✅ NEW: Ensure auth keys are cleared (redundant but safe)
                localStorage.removeItem('authStatus');
                localStorage.removeItem('userData');
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
            }
            
            navigate('/dashboard'); 
        } catch (error) {
            console.error("Logout failed:", error);
            if (isMountedRef.current) {
                setShowConfirmModal(false);
                setIsLoggingOut(false);
                alert('Logout failed. Please try again.');
            }
        }
    }, [dispatch, navigate]);

    const baseClassName = "px-4 py-2 text-sm font-semibold rounded-lg hover:bg-slate-100 hover:text-red-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <>
            {/* CONFIRMATION MODAL */}
            {showConfirmModal && createPortal(
                <div 
                    className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm modal-backdrop-animation"
                    onClick={handleCancel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-modal-title"
                >
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100 relative overflow-hidden modal-scale-animation"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleModalKeyDown}
                        tabIndex={-1}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            
                            <h3 
                                id="logout-modal-title"
                                className="text-xl font-bold text-slate-900 mb-2"
                            >
                                Sign Out?
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Are you sure you want to sign out? <br/>
                                You will need to log in again to access your dashboard.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                    type="button"
                                    aria-label="Cancel logout"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmLogout}
                                    className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm"
                                    type="button"
                                    aria-label="Confirm logout"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* LOADING SPINNER */}
            {isLoggingOut && createPortal(
                <div 
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300"
                    role="alert"
                    aria-live="assertive"
                    aria-label="Signing out, please wait"
                >
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-24 w-24 mb-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-24 w-24 bg-linear-to-tr from-red-600 to-red-500 shadow-2xl shadow-red-500/40 items-center justify-center border border-red-400/20">
                                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                                Signing Out...
                            </h3>
                            <p className="text-red-200/80 text-sm font-medium tracking-wide">
                                Securely clearing session & cache...
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* TRIGGER BUTTON */}
            <button 
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className={`${baseClassName} ${className}`}
                aria-label="Sign out of your account"
                type="button"
            >
                Logout
            </button>
        </>
    );
});

LogoutBtn.displayName = 'LogoutBtn';

export default LogoutBtn;