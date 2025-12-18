import Container from "../Container/Container.jsx";
import logo from '../../assets/Logo.png';
import { useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';


function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();


  const navItems = [
    { name: 'Home', slug: '/home', active: true },
    { name: 'All Posts', slug: '/all-posts', active: authStatus },
    { name: 'Dashboard', slug: '/dashboard', active: true },
  ];


  return (
    <header className='flex items-center w-full p-2 header user-drag-none user-select-none'>
      <Container>
        <div className='flex items-center justify-between w-full' style={{gap: 'var(--spacing-md)'}}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Logo" 
              style={{
                width: 'var(--logo-header-w)', 
                height: 'var(--logo-header-h)', 
                marginLeft: 'var(--logo-header-ml)'
              }}
            />
          </Link>


          {/* Navigation with responsive pill button design */}
          <nav className="flex sm:justify-center max-sm:justify-start max-sm:flex-1">
            <ul className="flex items-center gap-1.5 sm:gap-2 max-sm:w-full">
              {navItems.map((item, index) => (
                item.active && (
                  <li key={index} className="max-sm:flex-1">
                    <NavLink 
                      to={item.slug}
                      className={({ isActive }) => 
                        `inline-block w-full text-center px-2 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold transition-all shadow-sm whitespace-nowrap ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-indigo-200' 
                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'
                        }`
                      }
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                )
              ))} 
            </ul>
          </nav>            


          {/* Tagline - hidden on mobile */}
          <div className='text-center max-sm:hidden flex-shrink-0'>
            <h1 
              className='font-black tracking-tight'
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)' }}
            >
              <span className='text-gray-800'>Blog</span>{' '}
              <span className='bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent'>ideas</span>{' '}
              <span className='text-gray-800'>& stories</span>
            </h1>
            <p 
              className='text-indigo-600/70 font-medium tracking-wide border-t border-indigo-200/50 pt-1 mt-1'
              style={{ fontSize: 'clamp(0.625rem, 1.2vw, 0.875rem)' }}
            >
              Share your thoughts with the world
            </p>
          </div>
        </div>
      </Container>
    </header>
  );
}


export default Header;
