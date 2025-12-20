import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import { Button, Input } from './index.js';
import authService from '../appwrite/auth.js';
import { useForm } from 'react-hook-form';
import { parseErrorMessage } from '../utils/errorUtils';
import { createPortal } from 'react-dom';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        mode: "onBlur"
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const login = useCallback(async (data) => {
        if (!isMountedRef.current) return;
        
        setError("");
        setLoading(true);
        
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPassword = data.password;

        try {
            const session = await authService.login({
                email: cleanEmail,
                password: cleanPassword
            });
            
            if (!isMountedRef.current) return;
            
            if (session) {
                const userData = await authService.getCurrentUser();
                
                if (!isMountedRef.current) return;
                
                if (userData) {
                    dispatch(authLogin({ userData }));
                    
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            navigate('/dashboard');
                        }
                    }, 500);
                }
            }
        } catch (error) {
            if (!isMountedRef.current) return;
            
            console.error("Login Error:", error);
            setError(parseErrorMessage(error));
            setLoading(false);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    setError("");
                }
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const isFormDisabled = loading || isSubmitting;

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <div className='relative pt-20'>
            {/* Loading Overlay */}
            {loading && createPortal(
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-24 w-24 mb-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-24 w-24 bg-linear-to-tr from-red-600 to-red-500 shadow-2xl shadow-red-500/40 items-center justify-center border border-red-400/20">
                                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                                Logging In...
                            </h3>
                            <p className="text-red-200/80 text-sm font-medium tracking-wide">
                                Authenticating your credentials...
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Error Banner */}
            {error && (
                <div className='gpu-accelerate absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
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
                    <h2 className='text-2xl font-bold text-gray-800'>Login to Your Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Welcome back! Please enter your credentials</p>
                </div>

                <form onSubmit={handleSubmit(login)} className='space-y-4 flex flex-col justify-center'>
                    {/* Email Field */}
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter Your Email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="username"
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

                    {/* Password Field with Eye Toggle */}
                    <div>
                        <label className="inline-block mb-1.5 pl-1 text-sm font-medium text-gray-700"> {/* ✅ CHANGE 1: mb-1 → mb-1.5, added pl-1 */}
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your Password"
                                autoComplete="current-password"
                                disabled={isFormDisabled}
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: { 
                                        value: 8, 
                                        message: "Password must be at least 8 characters" 
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
                                    // Eye Slash Icon (Password Visible)
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    // Eye Open Icon (Password Hidden)
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p id="password-error" className="text-red-600 text-xs mt-1 text-left" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isFormDisabled}
                        className={`bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all font-semibold ${isFormDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                        aria-label="Sign in to your account"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : "Login"}
                    </Button>
                </form>

                <p className='mt-4 text-center text-gray-700'>
                    Don't have an account?{' '}
                    <Link 
                        to="/signup" 
                        className='interactive text-blue-500 hover:text-blue-600 font-semibold'
                        tabIndex={isFormDisabled ? -1 : 0}
                    >
                        Signup here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
