import React from 'react'
import assets from '../assets/assets'
import { AiToolsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
const AiInfo = () => {

    const navigate = useNavigate();
    return (
        <div className='flex flex-col items-center '>
            <div className='flex flex-col items-center'>
                <div className='text-6xl font-bold mt-20 mb-5'> Powerfull AI Tools</div>
                <div>Everything you need to create is in here</div>
            </div>

            <div className='flex flex-wrap mt-10 justify-center '>
            {AiToolsData.map((tool, index) => (
                <div key={index}  className='p-8 m-4 w-120 h-60 rounded-lg shadow-lg border border-gray-100 hover:bg-blue-300 bg-[#FDFDFE] flex flex-col   cursor-pointer'  onClick={() => navigate(tool.path)}>
                    <tool.Icon className='w-12 h-12 p-3 rounded-xl text-white' style={{background: `linear-gradient(to bottom,${tool.bg.from}, ${tool.bg.to})`}}/>
                    <h2 className='mt-6 mb-3 text-lg font-semibold'>{tool.title}</h2>
                    <div id="info">{tool.description}</div>
                </div>
            ))}
            
            </div>

        </div>
    )
}

export default AiInfo
