import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Protected({ children, authentication = true }) {
    const navigate = useNavigate();
    const authStatus = useSelector((state) => state.auth.status);

    useEffect(() => {
        // Protected route: Needs login but user is not logged in
        if (authentication && !authStatus) {
            navigate("/login", { replace: true });
            return;
        }
        
        // Public route: User already logged in, redirect to dashboard
        if (!authentication && authStatus) {
            navigate("/dashboard", { replace: true });
            return;
        }
        
        // Correct access - do nothing
    }, [authStatus, authentication, navigate]);

    // Just render children - Suspense in main.jsx handles loading
    return <>{children}</>;
}
