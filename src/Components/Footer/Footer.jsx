import React, { useMemo, memo } from 'react';
import DarkLogo from '../../assets/DarkLogo.webp';
import { Link } from 'react-router-dom';

// ✅ OPTIMIZATION 1: Move static data outside component (prevents recreation on every render)
const FOOTER_SECTIONS = [
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
      { label: "Github", to: "https://github.com/HiteshShonak", isExternal: true },
      { label: "Twitter", to: "https://x.com/Hitesh_Shonak", isExternal: true },
      { label: "Instagram", to: "https://instagraayeeHiteshhm.com/", isExternal: true },
      { label: "LinkedIn", to: "https://www.linkedin.com/in/hiteshshonak/", isExternal: true }
    ]
  }
];

// ✅ OPTIMIZATION 2: Wrap component in memo() to prevent unnecessary re-renders
const Footer = memo(() => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer 
      className="mt-auto w-full bg-linear-to-r from-gray-900 via-gray-900 to-gray-800 text-gray-100 border-t border-white/10 shadow-[0_-6px_16px_rgba(0,0,0,0.18)] backdrop-blur"
      aria-label="Site footer" // ✅ ENHANCEMENT 1: Accessible footer label
    >
      <div className="flex justify-between user-select-none user-drag-none px-3 sm:px-6 py-3 sm:py-6 flex-col gap-0 sm:flex-row md:items-start">
        
        {/* Logo & Copyright Section */}
        <div className="space-y-0 w-max">
          <Link 
            to="/" 
            aria-label="Return to homepage" // ✅ ENHANCEMENT 2: Accessible logo link
          >
            <img 
              src={DarkLogo} 
              alt="Blog Ideas & Stories - Dark Logo" // ✅ ENHANCEMENT 3: Descriptive alt text
              style={{ width: 'var(--logo-footer-w)', height: 'var(--logo-footer-h)' }} 
              className="object-contain"
            />
          </Link>
          <p 
            style={{ fontSize: 'var(--text-base)' }} 
            className="text-center text-gray-400"
          >
            &copy; {currentYear} Ideas & stories for curious minds.
          </p>
        </div>

        {/* Mobile Divider */}
        <div 
          className="w-full h-px bg-linear-to-r sm:hidden from-transparent via-gray-700 to-transparent my-2" 
          aria-hidden="true" // ✅ ENHANCEMENT 4: Hide decorative divider from screen readers
        />

        {/* Footer Navigation Links */}
        <nav 
          className="grid grid-cols-3 gap-3 sm:gap-8 lg:gap-16"
          aria-label="Footer navigation" // ✅ ENHANCEMENT 5: Accessible navigation label
        >
          {FOOTER_SECTIONS.map((section) => ( // ✅ OPTIMIZATION 3: Use section.title as key
            <div key={section.title}>
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
                {section.links.map((link) => ( // ✅ OPTIMIZATION 4: Use link.label as key
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a 
                        className="hover:text-indigo-300 transition-colors inline-block" 
                        href={link.to} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`${link.label} (opens in new tab)`} // ✅ ENHANCEMENT 6: Inform users link opens externally
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        className="hover:text-indigo-300 transition-colors inline-block" 
                        to={link.to}
                        aria-label={`Navigate to ${link.label}`} // ✅ ENHANCEMENT 7: Descriptive internal link label
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
});

// ✅ OPTIMIZATION 5: Add display name for React DevTools
Footer.displayName = 'Footer';

export default Footer;
