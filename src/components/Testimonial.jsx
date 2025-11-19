import React from 'react'
import { dummyTestimonialData } from '../assets/assets';
import { Icon } from 'lucide-react';
import assets from '../assets/assets';

const Testimonial = () => {
    return (
        <div>
            <div className='flex flex-col items-center justify-center p-8'>
                <div className='text-6xl font-bold'>Loved Our Work</div>
                <div> We dont just fake our words</div>
            </div>
            <div className='flex flex-wrap justify-center'>
                {dummyTestimonialData.map((item, index) => (
                    <div key={index} className=' p-8 w-100 h-90 border border-gray-200 shadow-xl rounded-3xl m-4'>

                        <div className='flex flex-row items-center '>
                            <img src={item.image} alt={item.name} className='mr-4' />
                            <div className='flex flex-col'>
                                <div>{item.name}</div>
                                <div>{item.title}</div>
                            </div>
                        </div>

                        <div className='mt-4 mb-3'><span>"</span>{item.content}<span>"</span></div>

                        <div className='flex flex-row items-center'>
                        {Array(5).fill(0).map((_, i) => (<img key={i} src={i < item.rating ? assets.star_icon : assets.star_dull_icon} alt="" />
                        ))}
                        </div>


                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonial
