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
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");

    const createAccount = async (data) => {
        setError("");

        // 1. CLEAN THE DATA
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
                    dispatch(login({ userData: currentUser }));
                    navigate('/');
                }
            }
        } catch (error) {
            setError("Signup failed. Please try again.");
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
                    <Input
                        label="Full Name "
                        type="text"
                        placeholder="Enter Your Full Name"
                        autoComplete="name"
                        {...register("name", { required: true })}
                    />
                    <Input
                        label="Email "
                        type="email"
                        placeholder="Enter Your Email"
                        // 2. DISABLE MOBILE KEYBOARD "HELPERS"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="username"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Invalid email address"
                            }
                        })}
                    />
                    <Input
                        label="Password "
                        type="password"
                        placeholder="Enter Your Password"
                        autoComplete="new-password"
                        {...register("password", {
                            required: true,
                            validate: {
                                minLength: (value) => value.length >= 6 || "Password must be at least 6 characters long"
                            }
                        })}
                    />
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