import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Protected({ children, authentication = true }) {
    const navigate = useNavigate();
    const authStatus = useSelector((state) => state.auth.status);

    useEffect(() => {
        if (authentication && !authStatus) {
            navigate("/login", { replace: true });
            return;
        }
        
        if (!authentication && authStatus) {
            navigate("/dashboard", { replace: true });
            return;
        }
        
    }, [authStatus, authentication, navigate]);

    return <>{children}</>;
}
