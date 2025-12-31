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
    if (authStatus) {
      authService.getCurrentUser()
        .then((userData) => {
          if (userData) {
            dispatch(login({ userData }));
          } else {
            dispatch(logout());
            authService.logout().catch(() => {
              console.log("No sessions to clean");
            });
          }
        })
        .catch((error) => {
          console.error('Auth validation failed:', error);
          dispatch(logout());
          authService.logout().catch(() => {
            console.log("No sessions to clean");
          });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); 

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
