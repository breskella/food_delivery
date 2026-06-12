import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="admin-brand">
        <div className="admin-brand-name">Avocado.</div>
        <div className="admin-brand-sub">Admin Panel</div>
      </div>
      <img className='profile' src={assets.profile_image} alt="" />
    </div>
  )
}

export default Navbar
