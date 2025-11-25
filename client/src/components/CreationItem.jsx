import React, { useState } from 'react'

const CreationItem = ({ type, title, createdAt, content }) => {

    const [expanded, setExpanded] = useState(false);
    // Simple date formatting utility




    return (
        <div className='p-4 bg-white rounded-xl shadow border border-gray-100 transition duration-300 hover:shadow-xl hover:border-indigo-400 cursor-pointer w-full flex flex-col'>
            <div className="flex justify-between items-center w-full">
                <div>
                    <p className='text-sm font-medium text-indigo-600 mb-1'>{type}</p>
                    <p className='text-lg font-bold text-gray-900 truncate'>{title}</p>
                    <p className='text-xs text-gray-500 mt-2'>Created: {createdAt}</p>
                </div>
                <button onClick={() => setExpanded(!expanded)} className='cursor-pointer ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium capitalize'>{type}</button>
            </div>
            {expanded && (
                <div >
                    {type === 'image' ? (
                        <div>
                            <img src={content} alt="image" className='mt-3 w-full max-w-md' />
                        </div>
                    ) : (
                        <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                            {content}
                        </div>
                    )}
                </div>
            )}

        </div>


    );
};
export default CreationItem;