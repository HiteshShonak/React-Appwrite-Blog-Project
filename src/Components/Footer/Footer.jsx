import Logo from '../../assets/Logo.png'
import DarkLogo from '../../assets/DarkLogo.png'
import { Link } from 'react-router-dom'



function Footer() {
  return (
    <footer className="fixed m-0 inset-x-0 bottom-0 z-20 bg-linear-to-r from-gray-900 via-gray-900 to-gray-800 text-gray-100 border-t border-white/10 shadow-[0_-6px_16px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="flex max-md:justify-between  user-select-none user-drag-none px-6 py-6 flex-col gap-0 sm:flex-row md:items-start md:justify-between">
        <div className="space-y-0 w-max ">
          <img src={DarkLogo} alt="Logo for Footer" style={{width: 'var(--logo-footer-w)', height: 'var(--logo-footer-h)'}} className="object-contain"/>
          <p style={{fontSize: 'var(--text-base)'}} className="text-center text-gray-400">&copy; {new Date().getFullYear()} Ideas & stories for curious minds.</p>
        </div>

        <div/>
        <div className="w-full h-px bg-linear-to-r sm:hidden from-transparent via-gray-700 to-transparent my-2"/>

    <div>
      <div className="container grid max-sm:grid-cols-3 sm:grid-cols-3 lg:gap-16">
          <div >
            <h4 style={{fontSize: 'var(--text-xs)'}} className="uppercase tracking-[0.25em] text-gray-500 mb-3">Company</h4>
            <ul className="space-y-2 text-gray-200" style={{fontSize: 'var(--text-base)'}}>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/about">About us</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/contact">Contact</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/careers">Careers</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{fontSize: 'var(--text-xs)'}} className="uppercase tracking-[0.25em] text-gray-500 mb-3">Resources</h4>
            <ul className="space-y-2 text-gray-200" style={{fontSize: 'var(--text-base)'}}>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/">Editorial picks</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/">Writing guides</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/">Community</Link></li>
              <li><Link className="hover:text-indigo-300 transition-colors" to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{fontSize: 'var(--text-xs)'}} className="uppercase tracking-[0.25em] text-gray-500 mb-3">Stay in touch</h4>
            <ul className="space-y-2 text-gray-200" style={{fontSize: 'var(--text-base)'}}>
              <li><a className="hover:text-indigo-300 transition-colors" href="https://example.com/newsletter" target="_blank" rel="noopener noreferrer">Newsletter</a></li>
              <li><a className="hover:text-indigo-300 transition-colors" href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a className="hover:text-indigo-300 transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a className="hover:text-indigo-300 transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </div>
        
      </div>
    </footer>
  )
}

export default Footer
