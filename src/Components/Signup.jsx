import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import { Button, Input } from './index.js';
import authService from '../appwrite/auth.js';
import appwriteService from '../appwrite/config.js';
import { useForm } from 'react-hook-form';
import { parseErrorMessage } from '../utils/errorUtils';
import { createPortal } from 'react-dom'; // 🚨 IMPORT for Loader

function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange"
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // 🚨 NEW LOADING STATE

    const createAccount = async (data) => {
        setError("");
        setLoading(true); // Start Loading

        const cleanData = {
            email: data.email.trim().toLowerCase(),
            password: data.password,
            name: data.name
        };

        try {
            const userData = await authService.createAccount(cleanData);
            
            if (userData) {
                const currentUser = await authService.getCurrentUser();
                
                if (currentUser) {
                    try {
                        await appwriteService.createUserProfile({
                            userId: currentUser.$id,
                            username: data.username.toLowerCase(),
                            bio: `Hi! I'm ${data.name}.`
                        });

                        dispatch(login({ userData: currentUser }));
                        navigate('/dashboard');

                    } catch (profileError) {
                        console.error("Profile Creation Failed - Rolling back session", profileError);
                        await authService.logout(); 
                        throw profileError; 
                    }
                }
            }
        } catch (error) {
            console.error("Signup Error", error);
            setError(parseErrorMessage(error));
            setLoading(false); // Stop loading on error
        }
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className='relative pt-10'>
            {/* 🚨 MODERN SAAS LOADER (GREEN THEME) */}
            {loading && createPortal(
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
                    <div className="relative flex flex-col items-center">
                        <div className="relative flex h-24 w-24 mb-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-24 w-24 bg-linear-to-tr from-green-600 to-green-500 shadow-2xl shadow-green-500/40 items-center justify-center border border-green-400/20">
                                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

            {error && (
                <div className='gpu-accelerate absolute -top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
                    <div className='gpu-accelerate bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce'>
                        <p className='font-semibold text-center text-sm'>{error}</p>
                    </div>
                </div>
            )}
            
            <div className='gpu-accelerate max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-800'>
                <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Create a New Account</h2>
                
                <form onSubmit={handleSubmit(createAccount)} className='space-y-4 flex justify-center flex-col'>
                    
                    {/* Full Name */}
                    <div>
                        <Input
                            label="Full Name "
                            type="text"
                            placeholder="Enter Your Full Name"
                            {...register("name", { required: "Full Name is required" })}
                        />
                        {errors.name && <p className="text-red-600 text-xs mt-1 text-left">{errors.name.message}</p>}
                    </div>

                    {/* Username */}
                    <div>
                        <Input
                            label="Username "
                            type="text"
                            placeholder="@username"
                            autoComplete="off"
                            {...register("username", { 
                                required: "Username is required",
                                minLength: { value: 4, message: "Min 4 characters" },
                                maxLength: { value: 20, message: "Max 20 characters" },
                                pattern: {
                                    value: /^[a-zA-Z0-9_.]+$/,
                                    message: "Only letters, numbers, dots, and underscores"
                                },
                                validate: async (value) => {
                                    try {
                                        const isAvailable = await appwriteService.isUsernameAvailable(value.toLowerCase());
                                        return isAvailable || "Username is already taken";
                                    } catch (error) {
                                        return true;
                                    }
                                }
                            })}
                        />
                        {errors.username && <p className="text-red-600 text-xs mt-1 text-left">{errors.username.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <Input
                            label="Email "
                            type="email"
                            placeholder="Enter Your Email"
                            {...register("email", {
                                required: "Email is required",
                                validate: {
                                    matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1 text-left">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <Input
                            label="Password "
                            type="password"
                            placeholder="Enter Your Password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "Password must be at least 8 characters long" }
                            })}
                        />
                        {errors.password && <p className="text-red-600 text-xs mt-1 text-left">{errors.password.message}</p>}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className={`bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all font-semibold ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Signing Up..." : "Signup"}
                    </Button>
                </form>

                <p className='mt-4 text-center text-gray-700'>
                    Already have an account? <Link to="/login" className='interactive text-blue-500 hover:text-blue-600'>Login here</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup;