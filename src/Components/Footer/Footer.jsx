import React, { useMemo } from 'react';
import DarkLogo from '../../assets/DarkLogo.webp';
import { Link } from 'react-router-dom';


function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Footer navigation data
  const footerSections = [
    {
      title: "Company",
      links: [
        { label: "About us", to: "/about-us", isExternal: false },
        { label: "Contact", to: "/contact", isExternal: false },
        { label: "Careers", to: "/", isExternal: false },
        { label: "Press", to: "/", isExternal: false }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Editorial picks", to: "/", isExternal: false },
        { label: "Writing guides", to: "/", isExternal: false },
        { label: "Community", to: "/", isExternal: false },
        { label: "FAQ", to: "/faq", isExternal: false }
      ]
    },
    {
      title: "Stay in touch",
      links: [
        { label: "Newsletter", to: "https://example.com/newsletter", isExternal: true },
        { label: "Twitter", to: "https://twitter.com", isExternal: true },
        { label: "Instagram", to: "https://instagram.com", isExternal: true },
        { label: "LinkedIn", to: "https://linkedin.com", isExternal: true }
      ]
    }
  ];

  return (
    <footer className="mt-auto w-full bg-linear-to-r from-gray-900 via-gray-900 to-gray-800 text-gray-100 border-t border-white/10 shadow-[0_-6px_16px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="flex justify-between user-select-none user-drag-none px-3 sm:px-6 py-3 sm:py-6 flex-col gap-0 sm:flex-row md:items-start">
        
        {/* Logo & Copyright Section */}
        <div className="space-y-0 w-max">
          <img 
            src={DarkLogo} 
            alt="Logo for Footer" 
            style={{ width: 'var(--logo-footer-w)', height: 'var(--logo-footer-h)' }} 
            className="object-contain"
          />
          <p 
            style={{ fontSize: 'var(--text-base)' }} 
            className="text-center text-gray-400"
          >
            &copy; {currentYear} Ideas & stories for curious minds.
          </p>
        </div>

        {/* Mobile Divider */}
        <div className="w-full h-px bg-linear-to-r sm:hidden from-transparent via-gray-700 to-transparent my-2" />

        {/* Footer Navigation Links */}
        <nav className="grid grid-cols-3 gap-3 sm:gap-8 lg:gap-16">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 
                style={{ fontSize: 'var(--text-xs)' }} 
                className="uppercase tracking-[0.25em] text-gray-500 mb-2 sm:mb-3"
              >
                {section.title}
              </h4>
              <ul 
                className="space-y-1.5 sm:space-y-2 text-gray-200" 
                style={{ fontSize: 'var(--text-base)' }}
              >
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.isExternal ? (
                      <a 
                        className="hover:text-indigo-300 transition-colors" 
                        href={link.to} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        className="hover:text-indigo-300 transition-colors" 
                        to={link.to}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;