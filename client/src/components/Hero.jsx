import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
const Hero = () => {

    const navigate = useNavigate();
  return (
    <div>
      <img src={assets.gradientBackground} alt="" className='h-screen sm:w-full lg:w-full z-0 ' />
      <div className="absolute inset-x-0 bottom-0 h-2/11
                  bg-gradient-to-t from-white to-transparent 
                  backdrop-blur-md z-0"></div>
            <div className='absolute inset-0 flex flex-col justify-center items-center text-center p-4  ' >
                <div
                    // Base (XS) | SM | MD | LG (default) | XL 
                    className='flex flex-col justify-center items-center 
             text-2xl sm:text-5xl md:text-6xl lg:text-7xl 
             font-bold text-black' 
                >
                    Create stunning content with <span className='text-purple-500'>AI tools</span>
                </div>
                <div className='pb-8 pt-2'>
                    Transform your content with the suite of our premium ai tools
                </div>
                <div className='flex flex-row gap-4'>
                    <button className='bg-primary text-white px-2 py-2 cursor-pointer rounded-[10px] pl-10 pr-10 ' onClick={() => navigate("/ai")}>
                        Start creating now
                    </button>

                    <button className='bg-white rounded-[10px] pl-10 pr-10'>
                        Watch demo
                    </button>
                </div>
                <div className='pt-9 flex flex-row gap-2'>
                    <img src={assets.user_group} alt="" className='w-25' />
                    <span className='flex items-center '>Trusted by 10k+ people</span>
                </div>
            </div>
    </div>
  )
}

export default Hero
