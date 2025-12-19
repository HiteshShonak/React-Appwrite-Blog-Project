import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import {Button, Input} from './index.js';
import authService from '../appwrite/auth.js';
import { useForm } from 'react-hook-form';
import { parseErrorMessage } from '../utils/errorUtils';
import { createPortal } from 'react-dom'; // 🚨 IMPORT for Loader

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // 🚨 NEW LOADING STATE

    const login = async (data) => {
        setError("");
        setLoading(true); // Start Loading
        
        // 1. CLEAN THE DATA
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPassword = data.password;

        try {
            const session = await authService.login({
                email: cleanEmail,
                password: cleanPassword
            });
            
            if(session){
                const userData = await authService.getCurrentUser();
                if(userData){
                    dispatch(authLogin({userData}));
                    navigate('/');
                }
            }
        } catch(error){
            setError(parseErrorMessage(error));
            setLoading(false); // Stop loading only on error
        }
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className='relative pt-20'>
            {/* 🚨 MODERN SAAS LOADER (RED THEME) */}
            {loading && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-24 w-24 mb-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-24 w-24 bg-gradient-to-tr from-red-600 to-red-500 shadow-2xl shadow-red-500/40 items-center justify-center border border-red-400/20">
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

            {error && (
                <div className='gpu-accelerate absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
                    <div className='gpu-accelerate bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce'>
                        <p className='font-semibold text-center text-sm'>{error}</p>
                    </div>
                </div>
            )}
            <div className='gpu-accelerate max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-800'>
                <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Login to Your Account</h2>
                <form onSubmit={handleSubmit(login)} className='space-y-4 flex flex-col justify-center'>
                    <Input
                        label="Email "
                        type="email"
                        placeholder="Enter Your Email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="username" 
                        {...register("email", { required: true, 
                            validate: {
                                matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Invalid email address"
                            }
                        })}
                    />
                    <Input
                        label="Password "
                        type="password"
                        placeholder="Enter Your Password"
                        autoComplete="current-password"
                        {...register("password", { required: true })}
                    />
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className={`bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all font-semibold ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>
                <p className='mt-4 text-center text-gray-700'>
                    Don't have an account? <Link to="/signup" className='interactive text-blue-500 hover:text-blue-600'>Signup here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login