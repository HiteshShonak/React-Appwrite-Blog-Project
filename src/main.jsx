import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './Store/store.js'

// Import Immersive Skeletons
import { 
  DashboardSkeletonSelector, 
  PostSkeleton, 
  AuthorProfileSkeleton, 
  AllPostsSkeleton,
  LoginSkeleton,
  SignupSkeleton,
  EditorLoader,
  HomeSkeleton, 
  AboutUsSkeleton,
  ContactSkeleton,
  FaqSkeleton,
  GlobalSplash,
} from './Components/Skeletons.jsx'

import AuthLayout from './Components/AuthLayout.jsx'

// Lazy Load Pages
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const AllPosts = lazy(() => import('./pages/AllPosts.jsx'))
const AddPost = lazy(() => import('./pages/AddPost.jsx'))
const EditPost = lazy(() => import('./pages/EditPost.jsx'))
const Post = lazy(() => import('./pages/Post.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const AboutUs = lazy(() => import('./pages/AboutUs.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const FAQ = lazy(() => import('./pages/FAQ.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const AuthorProfile = lazy(() => import('./pages/AuthorProfile.jsx'))

const SuspenseLayout = ({ children, fallback }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <SuspenseLayout fallback={<GlobalSplash />}>
            <Home />
          </SuspenseLayout>
        ),
      },
      {
        path: '/home',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/login',
        element: (
          <AuthLayout authentication={false}>
            <SuspenseLayout fallback={<LoginSkeleton />}>
              <Login />
            </SuspenseLayout>
          </AuthLayout>
        ),
      },
      {
        path: '/signup',
        element: (
          <AuthLayout authentication={false}>
            <SuspenseLayout fallback={<SignupSkeleton />}>
              <Signup />
            </SuspenseLayout>
          </AuthLayout>
        ),
      },
      {
        path: '/all-posts',
        element: (
          
            <SuspenseLayout fallback={<AllPostsSkeleton />}>
              <AllPosts />
            </SuspenseLayout>
          
        ),
      },
      {
        path: '/add-post',
        element: (
          <AuthLayout authentication={true}>
            <SuspenseLayout fallback={<EditorLoader />}>
              <AddPost />
            </SuspenseLayout>
          </AuthLayout>
        ),
      },
      {
        path: '/edit-post/:slug',
        element: (
          <AuthLayout authentication={true}>
            <SuspenseLayout fallback={<EditorLoader />}>
              <EditPost />
            </SuspenseLayout>
          </AuthLayout>
        ),
      },
      {
        path: '/post/:slug',
        element: (
          
            <SuspenseLayout fallback={<PostSkeleton />}>
              <Post />
            </SuspenseLayout>
          
        ),
      },
      {
        path: '/dashboard',
        element: (
          
          <SuspenseLayout fallback={<DashboardSkeletonSelector />}>
            <Dashboard />
          </SuspenseLayout>
        ),
      },
      {
        path: '/author/:username',
        element: (
          
          <SuspenseLayout fallback={<AuthorProfileSkeleton />}>
            <AuthorProfile />
          </SuspenseLayout>
        ),
      },
      {
        path: '/about-us',
        element: (
          <SuspenseLayout fallback={<AboutUsSkeleton />}>
            <AboutUs />
          </SuspenseLayout>
        ),
      },
      {
        path: '/contact',
        element: (
          <SuspenseLayout fallback={<ContactSkeleton />}>
            <Contact />
          </SuspenseLayout>
        ),
      },
      {
        path: '/faq',
        element: (
          <SuspenseLayout fallback={<FaqSkeleton />}>
            <FAQ />
          </SuspenseLayout>
        ),
      },
      {
        path: '*',
        element: (
          <SuspenseLayout fallback={<GlobalSplash />}>
            <NotFound />
          </SuspenseLayout>
        ),
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)