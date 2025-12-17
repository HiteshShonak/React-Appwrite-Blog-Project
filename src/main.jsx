import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import { Provider } from 'react-redux';
import store from './Store/store.js';
import AuthLayout from './Components/AuthLayout.jsx';
import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx'
import Home from './pages/Home.jsx'
import AllPosts from './pages/AllPosts.jsx'
import AddPost from './pages/AddPost.jsx'
import EditPost from './pages/EditPost.jsx'
import Post from './pages/Post.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Contact from './pages/Contact.jsx'
import FAQ from './pages/FAQ.jsx'
import NotFound from './pages/NotFound.jsx'
import AuthorProfile from './pages/AuthorProfile.jsx'

const router = createBrowserRouter([
  {path: '/',  
  element: <App />,

  children: [ 
  {path: '',
  element: <Home /> },
  {path: '/home',
  element: <Home /> },

  {path: '/login',
  element: (<AuthLayout authentication={false}><Login /></AuthLayout>)
  },
  {path: '/signup',
  element: (<AuthLayout authentication={false}><Signup /></AuthLayout>)
  },
  {path: "/all-posts",
    element: (<AuthLayout authentication={true}><AllPosts /></AuthLayout>)
  },
  {path: '/add-post',
    element: (<AuthLayout authentication={true}><AddPost /></AuthLayout>)
  },
  {path: '/edit-post/:slug',
    element: (<AuthLayout authentication={true}><EditPost /></AuthLayout>)
  },
  {path: '/post/:slug',
    element: (<AuthLayout authentication={true}><Post /></AuthLayout>)
  },
  {path: "/dashboard",
    element: <Dashboard />
  },
  {path:"/about-us",
    element:<AboutUs />
  },
  {path: "/contact",
    element: <Contact />
  },
  {path: "/faq",
    element: <FAQ />
  },
  {path: "/author/:username",
   element: <AuthorProfile />,
  },
  {path: "*", 
   element: <NotFound />,
  },
  ]
  }]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
