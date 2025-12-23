import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import { Button, Input } from './index.js';
import authService from '../appwrite/auth.js';
import appwriteService from '../appwrite/config.js';
import { useForm } from 'react-hook-form';
import { parseErrorMessage } from '../utils/errorUtils';
import { createPortal } from 'react-dom';

// Debounce utility function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                resolve(await func(...args));
            }, delay);
        });
    };
};

function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // ✅ WATCH: Monitors both password and username for real-time UI updates
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        mode: "onChange"
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [usernameAvailable, setUsernameAvailable] = useState(null); 
    
    const isMountedRef = useRef(true);
    const passwordValue = watch("password");
    const usernameValue = watch("username"); // ✅ NEW: Watch username to handle length < 4 visual logic
    
    // ✅ OPTIMIZED: 500ms Debounce for API call
    const debouncedUsernameCheck = useMemo(
        () => debounce(async (username) => {
            if (!username || username.length < 4) return null;
            try {
                const isAvailable = await appwriteService.isUsernameAvailable(username.toLowerCase());
                return isAvailable;
            } catch (error) {
                console.error('Username check failed:', error);
                return true; 
            }
        }, 500), 
        []
    );

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // ✅ LOGIC: Scroll Lock
    useEffect(() => {
        const isFormLoading = loading || isSubmitting;
        document.body.style.overflow = isFormLoading ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [loading, isSubmitting]);

    const createAccount = useCallback(async (data) => {
        if (!isMountedRef.current) return;
        
        setError("");
        setLoading(true);

        const cleanData = {
            email: data.email.trim().toLowerCase(),
            password: data.password,
            name: data.name.trim()
        };

        try {
            const userData = await authService.createAccount(cleanData);
            
            if (!isMountedRef.current) return;
            
            if (userData) {
                const currentUser = await authService.getCurrentUser();
                
                if (!isMountedRef.current) return;
                
                if (currentUser) {
                    try {
                        await appwriteService.createUserProfile({
                            userId: currentUser.$id,
                            username: data.username.toLowerCase().trim(),
                            bio: `Hi! I'm ${data.name.trim()}.`
                        });

                        if (!isMountedRef.current) return;

                        dispatch(login({ userData: currentUser }));
                        
                        setTimeout(() => {
                            if (isMountedRef.current) navigate('/dashboard');
                        }, 500);

                    } catch (profileError) {
                        console.error("Profile Creation Failed", profileError);
                        if (!isMountedRef.current) return;
                        await authService.logout();
                        throw profileError;
                    }
                }
            }
        } catch (error) {
            if (!isMountedRef.current) return;
            console.error("Signup Error", error);
            setError(parseErrorMessage(error));
            setLoading(false);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) setError("");
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const isFormLoading = loading || isSubmitting;
    const isFormDisabled = isFormLoading;

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <div className='relative pt-10 pb-20'>
            {/* Signup Loader */}
            {isFormLoading && createPortal(
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-24 w-24 mb-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-24 w-24 bg-linear-to-tr from-green-600 to-green-500 shadow-2xl shadow-green-500/40 items-center justify-center border border-green-400/20">
                                <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                                Creating Account...
                            </h3>
                            <p className="text-green-200/80 text-sm font-medium tracking-wide">
                                Setting up your profile & dashboard...
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Error Banner */}
            {error && (
                <div className='gpu-accelerate absolute -top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
                    <div className='gpu-accelerate bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce flex items-center gap-3'>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className='font-semibold text-sm'>{error}</p>
                    </div>
                </div>
            )}
            
            <div className='gpu-accelerate max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-800'>
                <div className="mb-6 text-center">
                    <h2 className='text-2xl font-bold text-gray-800'>Create a New Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Join our community of writers</p>
                </div>
                
                <form onSubmit={handleSubmit(createAccount)} className='space-y-4 flex justify-center flex-col'>
                    
                    {/* Full Name */}
                    <div>
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Enter Your Full Name"
                            disabled={isFormDisabled}
                            aria-invalid={errors.name ? "true" : "false"}
                            aria-describedby={errors.name ? "name-error" : undefined}
                            {...register("name", { 
                                required: "Full Name is required",
                                minLength: { value: 2, message: "Name too short" },
                                maxLength: { value: 50, message: "Name too long" },
                                pattern: {
                                    value: /^[a-zA-Z\s]+$/,
                                    message: "Only letters and spaces allowed"
                                }
                            })}
                        />
                        {errors.name && (
                            <p id="name-error" className="text-red-600 text-xs mt-1 text-left" role="alert">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="inline-block mb-1.5 pl-1 text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="@username"
                                autoComplete="off"
                                disabled={isFormDisabled}
                                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${errors.username ? 'border-red-500 focus:ring-red-500' : 
                                      usernameAvailable === true && usernameValue?.length >= 4 ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500'}
                                `}
                                aria-invalid={errors.username ? "true" : "false"}
                                aria-describedby={errors.username ? "username-error" : "username-help"}
                                {...register("username", { 
                                    required: "Username is required",
                                    minLength: { value: 4, message: "Min 4 characters" },
                                    maxLength: { value: 20, message: "Max 20 characters" },
                                    pattern: {
                                        value: /^[a-zA-Z0-9_.]+$/,
                                        message: "Only letters, numbers, dots, and underscores"
                                    },
                                    validate: async (value) => {
                                        if (!value || value.length < 4) {
                                            setUsernameAvailable(null);
                                            return true; 
                                        }
                                        const isAvailable = await debouncedUsernameCheck(value);
                                        setUsernameAvailable(isAvailable);
                                        return isAvailable || "Username is already taken";
                                    }
                                })}
                            />
                            
                            {/* STATUS ICON: Explicitly hides if length < 4 */}
                            {usernameAvailable !== null && usernameValue && usernameValue.length >= 4 && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    {usernameAvailable ? (
                                        <svg className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-500 animate-in fade-in zoom-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </span>
                            )}
                        </div>

                        {/* Helper Text */}
                        {errors.username ? (
                            <p id="username-error" className="text-red-600 text-xs mt-1 text-left" role="alert">
                                {errors.username.message}
                            </p>
                        ) : usernameAvailable === true && usernameValue?.length >= 4 ? (
                            <p id="username-success" className="text-green-600 text-xs mt-1 text-left font-semibold">
                                Username is available!
                            </p>
                        ) : (
                            <p id="username-help" className="text-gray-500 text-xs mt-1 text-left">
                                4-20 characters, letters, numbers, dots, underscores
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter Your Email"
                            autoComplete="email"
                            disabled={isFormDisabled}
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            {...register("email", {
                                required: "Email is required",
                                validate: {
                                    matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && (
                            <p id="email-error" className="text-red-600 text-xs mt-1 text-left" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="inline-block mb-1.5 pl-1 text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your Password"
                                autoComplete="new-password"
                                disabled={isFormDisabled}
                                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${errors.password ? 'border-red-500 focus:ring-red-500' : 
                                      passwordValue && !errors.password ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500'}
                                `}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Password must be at least 8 characters long" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                        message: "Include uppercase, lowercase, and number"
                                    }
                                })}
                            />
                            
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                disabled={isFormDisabled}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors disabled:opacity-50"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={isFormDisabled ? -1 : 0}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        {errors.password ? (
                            <p id="password-error" className="text-red-600 text-xs mt-1 text-left" role="alert">
                                {errors.password.message}
                            </p>
                        ) : passwordValue && passwordValue.length > 0 ? (
                            <p id="password-success" className="text-green-600 text-xs mt-1 text-left font-semibold">
                                Password looks good!
                            </p>
                        ) : (
                            <p id="password-help" className="text-gray-500 text-xs mt-1 text-left">
                                Min 8 chars with uppercase, lowercase, and number
                            </p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isFormDisabled}
                        className={`bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all font-semibold ${isFormDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                        aria-label="Create your account"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing Up...
                            </span>
                        ) : "Create Account"}
                    </Button>
                </form>

                <p className='mt-4 text-center text-gray-700'>
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        className='interactive text-blue-500 hover:text-blue-600 font-semibold'
                        tabIndex={isFormDisabled ? -1 : 0}
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;