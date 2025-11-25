import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk, useUser } from '@clerk/clerk-react';

const Navbar = () => {

    const { user } = useUser();
    const { openSignIn } = useClerk();
    const navigate = useNavigate();
    return (
        <div className='fixed  w-full backdrop-blur-2xl flex justify-between items-center py-3  px-8 sm:px-20 xl:px-32 z-1'>
            <img src={assets.logo} alt="logo" className='w-40 sm:w-50 cursor-pointer' onClick={() => navigate('/')} />

            {user ? <UserButton appearance={{
                    elements: {
                        
                        avatarBox: {
                            width: "35px", 
                            height: "35px", 
                        },
                        
                    }
                }}/> : (
                <button className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5' onClick={() => openSignIn()}> Get Started <ArrowRight className='w-4 h-4' /> </button>)}



        </div>
    )
}

export default Navbar
