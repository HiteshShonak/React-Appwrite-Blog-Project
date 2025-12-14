import { useDispatch } from 'react-redux';
import authService from '../../appwrite/auth.js';
import { logout } from '../../Store/authSlice.js';

function LogoutBtn() {
    const dispatch = useDispatch();

    const logoutHandler = () => {
        authService.logout()
        .then(() => {
            dispatch(logout());
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
    };


  return(
    <button onClick={logoutHandler} style={{paddingLeft: 'var(--btn-px)', paddingRight: 'var(--btn-px)', paddingTop: 'var(--btn-py)', paddingBottom: 'var(--btn-py)', fontSize: 'var(--text-sm)', borderRadius: 'var(--btn-radius)'}} 
    className="bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all font-semibold" >
    Logout
    </button>
  )
}


export default LogoutBtn