import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header, Footer } from './Components/index.js'
import authService from './appwrite/auth.js'
import { login, logout } from './Store/authSlice.js'
import { GlobalSplash } from './Components/Skeletons.jsx'


function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    // ✅ Redux already loaded from localStorage via authSlice initialState
    // Only need to validate session with backend if user appears logged in
    
    if (authStatus) {
      // User has auth in localStorage, verify with backend
      authService.getCurrentUser()
        .then((userData) => {
          if (userData) {
            dispatch(login({ userData }));
          } else {
            // Session expired
            dispatch(logout());
          }
        })
        .catch((error) => {
          console.error('Auth validation failed:', error);
          dispatch(logout());
        })
        .finally(() => setLoading(false));
    } else {
      // Not logged in, skip backend check
      setLoading(false);
    }
  }, []) // ✅ Only run once on mount

  if (loading) {
    return <GlobalSplash />; 
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollRestoration />
      <Header />
      <main 
        id="main-content"
        className="grow"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
