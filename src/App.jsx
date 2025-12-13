import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './Components/Header/Header.jsx'
import Footer from './Components/Footer/Footer.jsx'

function App() {

  console.log(import.meta.env.VITE_APPWRITE_URL);

  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App
