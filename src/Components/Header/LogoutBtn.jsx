import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import authService from '../../appwrite/auth.js';
import { logout } from '../../Store/authSlice.js';

function LogoutBtn() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // 2. Initialize navigate

    const logoutHandler = () => {
        authService.logout()
        .then(() => {
            // Update Redux state
            dispatch(logout());
            
            // 3. Force redirect to Login (or Home) page
            // This clears the current view so they don't see protected content
            navigate('/home'); 
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    return (
        <button 
            onClick={logoutHandler} 
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow"
        >
            Logout
        </button>
    )
}

export default LogoutBtn;