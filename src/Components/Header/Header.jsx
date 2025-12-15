import Container from "../Container/Container.jsx";
import logo from '../../assets/Logo.png'
import { useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { act } from 'react';
import LogoutBtn from "./LogoutBtn.jsx";

function Header() {
  
  const authStatus = useSelector((state) => state.auth.status);
  ;

  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', slug: '/home', active: true },
    {name: 'Login', slug: '/login', active: !authStatus },
    {name: 'Signup', slug: '/signup', active: !authStatus },
    {name: 'All Posts', slug: '/all-posts', active: authStatus },
    {name: 'Add Post', slug: '/add-post', active: authStatus },
  ];



  return (
    <div>
        <header className='flex items-center w-full p-2 header user-drag-none user-select-none'>
          <Container>
            <div className='flex items-center justify-between w-full' style={{gap: 'var(--spacing-md)'}}>
              <Link to="/">
              <img src={logo} alt="Logo" style={{width: 'var(--logo-header-w)', height: 'var(--logo-header-h)', marginLeft: 'var(--logo-header-ml)'}}/>
              </Link>

              <nav className="flex sm:justify-center max-sm:justify-start align-center">

                <ul className=" flex items-center w-full" style={{gap: 'var(--spacing-lg)'}}>
                  {navItems.map((item, index) => (
                    item.active && <li key={index} >
                      <NavLink 
                        to={item.slug} 
                        onClick={() => navigate(item.slug)}
                        className={`hover:text-indigo-500 transition-colors ${item.active ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
                        style={({ isActive }) => isActive ? {color: 'tomato', fontSize: 'var(--text-sm)'} : {fontSize: 'var(--text-sm)'}}
                        
                      >
                        {item.name} 
                      </NavLink>
                    </li>
                  ))}

                  {authStatus ? (
                    <li>
                      <LogoutBtn />
                    </li>
                  ) : null}

                  
                      
                  
                </ul>
          
              </nav>            
            

            <div className='text-center max-sm:hidden'>
              <h1 style={{fontSize: 'var(--text-xl)'}} className='font-black tracking-tight'>
                <span className='text-gray-800'>Blog</span> <span className='bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent'>ideas</span> <span className='text-gray-800'>& stories</span>
              </h1>
              <p style={{fontSize: 'var(--text-subtitle)'}} className='text-indigo-600/70 font-medium tracking-wide border-t border-indigo-200/50 pt-1 mt-1'>Share your thoughts with the world</p>
            </div>
            
          </div>
          
          </Container>
          
        </header>
    </div>
  )
}  

export default Header