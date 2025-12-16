import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import { Button, Input } from './index.js';
import authService from '../appwrite/auth.js';
import { useForm } from 'react-hook-form';

function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // 1. Get 'errors' from formState so we can show them
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");

    const createAccount = async (data) => {
        setError("");

        // 2. CLEAN THE DATA
        const cleanData = {
            email: data.email.trim().toLowerCase(),
            password: data.password, // Don't trim password
            name: data.name
        };

        try {
            const userData = await authService.createAccount(cleanData);
            if (userData) {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    dispatch(login({ userData: currentUser }));
                    // 3. REDIRECT TO DASHBOARD (Not Home)
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            setError(error.message);
        }
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className='relative pt-20'>
            {/* Global Backend Error */}
            {error && (
                <div className='absolute -top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
                    <div className='bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce'>
                        <p className='font-semibold text-center text-sm'>{error}</p>
                    </div>
                </div>
            )}
            
            <div className='max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-800'>
                <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Create a New Account</h2>
                
                <form onSubmit={handleSubmit(createAccount)} className='space-y-4 flex justify-center flex-col'>
                    
                    {/* FULL NAME */}
                    <div>
                        <Input
                            label="Full Name "
                            type="text"
                            placeholder="Enter Your Full Name"
                            autoComplete="name"
                            {...register("name", { required: "Full Name is required" })}
                        />
                        {errors.name && <p className="text-red-600 text-xs mt-1 text-left">{errors.name.message}</p>}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <Input
                            label="Email "
                            type="email"
                            placeholder="Enter Your Email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="username"
                            {...register("email", {
                                required: "Email is required",
                                validate: {
                                    // Improved Regex
                                    matchPattern: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) || "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1 text-left">{errors.email.message}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <Input
                            label="Password "
                            type="password"
                            placeholder="Enter Your Password"
                            autoComplete="new-password"
                            {...register("password", {
                                required: "Password is required",
                                // 4. FIX: Set minLength to 8 to match Appwrite
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters long"
                                }
                            })}
                        />
                        {/* Show Password Error */}
                        {errors.password && <p className="text-red-600 text-xs mt-1 text-left">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all font-semibold">
                        Signup
                    </Button>
                </form>

                <p className='mt-4 text-center text-gray-700'>
                    Already have an account? <Link to="/login" className='text-blue-500 hover:text-blue-600'>Login here</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup