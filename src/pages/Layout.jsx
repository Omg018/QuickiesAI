import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MenuIcon, X } from 'lucide-react';
import assets from '../assets/assets';
import Sidebar from '../components/Sidebar';
import { SignIn, useUser } from '@clerk/clerk-react';

const Layout = () => {
  const {user} = useUser();
  const [sidebar, setSidebar] = useState(true);
  const navigate = useNavigate();
  return user ? (
    <div>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img src={assets.logo} alt="" onClick={() => navigate('/')} className='w-50 cursor-pointer' />
        {sidebar ? <X className='w-6 h-6 cursor-pointer' onClick={() => setSidebar(false)} /> : <MenuIcon className='w-6 h-6 cursor-pointer' onClick={() => setSidebar(true)} />}
      </nav>
      <div className='w-full flex'>
        <div className={`
            h-[calc(100vh-56px)] 
            transition-all 
            duration-300
            ${sidebar ? 'w-64' : 'w-0 overflow-hidden'} 
        `}>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        </div>
        <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-56px)]">
          <Outlet />  
        </div>
      </div>
    </div>
  ): (<>
    <div className="flex justify-center items-center h-screen ">
        <SignIn />
    </div>
    </>)
}

export default Layout
