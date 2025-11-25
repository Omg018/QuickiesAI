import { PricingTable } from '@clerk/clerk-react'
import React from 'react'

const Plan = () => {
  return (
    <div className='max-w-2xl mx-auto z-20 my-9'>
        <div className='text-center'>
            <h2 className='text-slate-700 text-[42px] font-semibold' >Chooose your plan</h2>
            <p className='text-gray-500 max-w-lg mx-auto mb-30'>Find the perfect plan by your content creation needs</p>
            </div>
        <div className='max-sm:mx-8'>
            <PricingTable/>



        </div>
      
    </div>
  )
}

export default Plan
