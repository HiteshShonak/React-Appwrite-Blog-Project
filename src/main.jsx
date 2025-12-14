import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import Home from './Components/Home.jsx'
import { Provider } from 'react-redux';
import store from './Store/store.js';

const router = createBrowserRouter([
  {path: '/',  
  element: <App />,
  
  children: [ 
  {path: '',
  element: <Home /> },
  {path: '/home',
  element: <Home /> }
  ]
    
  }]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
