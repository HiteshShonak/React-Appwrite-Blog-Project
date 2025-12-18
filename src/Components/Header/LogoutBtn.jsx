import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../../appwrite/auth.js';
import { logout } from '../../Store/authSlice.js';


function LogoutBtn({ className = "" }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = () => {
        authService.logout()
        .then(() => {
            dispatch(logout());
            navigate('/home'); 
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    // Base styling that always applies
    const baseClassName = "px-4 py-2 text-sm font-semibold rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md";

    return (
        <button 
            onClick={logoutHandler} 
            className={`${baseClassName} ${className}`}
        >
            Logout
        </button>
    )
}

export default LogoutBtn;