import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../Store/authSlice.js';
import { useDispatch } from 'react-redux';
import {Button, Input} from './index.js';
import authService from '../appwrite/auth.js';
import { useForm } from 'react-hook-form';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");

    const login = async (data) => {
        setError("");
        
        // 1. CLEAN THE DATA (The Mobile Fix)
        // Mobile keyboards add invisible spaces. We must remove them.
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPassword = data.password; // Don't trim passwords (spaces might be intentional)

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
            {error && (
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4'>
                    <div className='bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce'>
                        <p className='font-semibold text-center text-sm'>{error}</p>
                    </div>
                </div>
            )}
            <div className='max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-800'>
                <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Login to Your Account</h2>
                <form onSubmit={handleSubmit(login)} className='space-y-4 flex flex-col justify-center'>
                    <Input
                        label="Email "
                        type="email"
                        placeholder="Enter Your Email"
                        // 2. DISABLE MOBILE KEYBOARD "HELPERS"
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
                    <Button type="submit" className="bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all font-semibold">Login</Button>
                </form>
                <p className='mt-4 text-center text-gray-700'>
                    Don't have an account? <Link to="/signup" className='text-blue-500 hover:text-blue-600'>Signup here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login