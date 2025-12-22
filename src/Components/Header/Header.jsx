import React, { memo } from 'react';
import Container from "../Container/Container.jsx";
import logo from '../../assets/Logo.webp';
import { Link, NavLink } from 'react-router-dom';

// ✅ OPTIMIZATION: Move static data outside component
const NAV_ITEMS = [
  { name: 'Home', slug: '/', active: true },
  { name: 'All Posts', slug: '/all-posts', active: true },
  { name: 'Dashboard', slug: '/dashboard', active: true },
];

// ✅ OPTIMIZATION: Wrap in memo() to prevent unnecessary re-renders
const Header = memo(() => {
  return (
    <header className='flex items-center w-full p-2 header user-drag-none user-select-none'>
      {/* ✅ ENHANCEMENT 3: Skip to Content Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        Skip to content
      </a>

      <Container>
        <div className='flex items-center justify-between w-full' style={{gap: 'var(--spacing-md)'}}>
          {/* Logo */}
          <Link 
            to="/" 
            className="shrink-0"
            aria-label="Homepage"
          >
            <img 
              src={logo} 
              alt="Blog Ideas & Stories Logo" 
              style={{
                width: 'var(--logo-header-w)',
                marginLeft: 'var(--logo-header-ml)'
              }}
            />
          </Link>

          {/* Navigation with responsive pill button design */}
          <nav 
            className="flex sm:justify-center max-sm:justify-start max-sm:flex-1"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-1.5 sm:gap-2 max-sm:w-full">
              {NAV_ITEMS.map((item) => (
                item.active && (
                  <li key={item.slug} className="max-sm:flex-1"> {/* ✅ ENHANCEMENT 1: Unique key */}
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
                      aria-label={`Navigate to ${item.name}`}
                    >
                      {({ isActive }) => ( /* ✅ ENHANCEMENT 2: aria-current */
                        <span aria-current={isActive ? 'page' : undefined}>
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )
              ))} 
            </ul>
          </nav>            

          {/* Tagline - hidden on mobile */}
          <div className='text-center max-sm:hidden shrink-0' aria-hidden="true">
            <h1 
              className='font-black tracking-tight'
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)' }}
            >
              <span className='text-gray-800'>Blog</span>{' '}
              <span className='bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent'>ideas</span>{' '}
              <span className='text-gray-800'>& stories</span>
            </h1>
            <p 
              className='text-slate-700 font-medium tracking-wide border-t border-slate-200 pt-1 mt-1'
              style={{ fontSize: 'clamp(0.625rem, 1.2vw, 0.875rem)' }}>
              Share your thoughts with the world
            </p>

          </div>
        </div>
      </Container>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
