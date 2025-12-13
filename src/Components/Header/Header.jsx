import React from 'react'
import logo from '../../assets/Logo.png'

function Header() {
  return (
    <div>
        <header className='flex items-center border-b-2 border-gray-300 w-full p-4 header user-drag-none user-select-none'>
        <img src={logo} alt="Logo" className='w-40 h-20 ml-8'/>
        </header>
    </div>
  )
}  

export default Header