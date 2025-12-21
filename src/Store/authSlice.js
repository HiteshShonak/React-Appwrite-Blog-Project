import { createSlice } from "@reduxjs/toolkit";


const getInitialAuthState = () => {
    try {
        const authStatus = localStorage.getItem('authStatus');
        const storedUserData = localStorage.getItem('userData');
        
        if (authStatus === 'true' && storedUserData) {
            return {
                status: true,
                userData: JSON.parse(storedUserData)
            };
        }
    } catch (error) {
        console.error('Error loading auth from localStorage:', error);
    }
    
    return {
        status: false,
        userData: null
    };
};

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialAuthState(),
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            
            // Save to localStorage
            localStorage.setItem('authStatus', 'true');
            localStorage.setItem('userData', JSON.stringify(action.payload.userData));
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            
            // Clear from localStorage
            localStorage.removeItem('authStatus');
            localStorage.removeItem('userData');
        }
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;