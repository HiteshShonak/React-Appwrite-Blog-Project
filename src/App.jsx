import './App.css'
import { Outlet } from 'react-router-dom'
import {Header, Footer} from './Components/index.js'
import { useState, useEffect, use,  } from 'react'
import { useDispatch } from 'react-redux';
import authService from './appwrite/auth.js';
import {login, logout} from './Store/authSlice.js';


function App() {

  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if(userData){
        dispatch(login({userData}));
      }
      else{
        dispatch(logout());
      }
    })
    .catch(() => {
      dispatch(logout());
      //error due to no user logged in

    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  return (!loading ? (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  ) : (
    
    null
  )
  );
}

export default App
