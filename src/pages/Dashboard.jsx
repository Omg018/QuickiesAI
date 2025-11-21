import { Protect } from '@clerk/clerk-react'
import { React, useState, useEffect } from 'react'
import CreationItem from '../components/CreationItem'
import {dummyCreationData} from '../assets/assets'

const Dashboard = () => {

  
  const MOCK_CREATIONS = dummyCreationData;
  const [creations, setCreations] = useState(MOCK_CREATIONS);

  return (
    <div className='flex flex-col p-6 space-y-6 bg-gray-50 min-h-screen '>

      <div className='flex flex-col sm:flex-row gap-6'>

        <div className='flex-1 p-6 bg-white rounded-xl shadow-lg border border-gray-200'>
          <h3 className='text-xl font-semibold text-gray-800 mb-2'>Total Creations</h3>
          <p className='text-4xl font-bold text-indigo-600'>{creations.length}</p>

        </div>

        <div className='flex-1 p-6 bg-white rounded-xl shadow-lg border border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>Plan Status</h2>
          <Protect plan='premium' fallback='Free'  >Premium</Protect>

        </div>

      </div>
      <div className='flex flex-col space-y-4'>
        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2'>Recent Creations</h2>

        {creations.length > 0 ? (
          <div className=''>
            {creations.map((creation) => (
              <CreationItem className='mb-4'
                key={creation.id}
                type={creation.type}
                title={creation.title}
                createdAt={creation.created_at}
                content={creation.content}
              />
            ))}
          </div>
        ) : (
          <div className='p-10 text-center bg-white rounded-xl shadow border border-dashed text-gray-500'>
            <p className='font-medium text-lg'>No creations yet!</p>
            <p className='text-sm mt-1'>Start generating content to see it here.</p>
          </div>
        )}

      </div>

    </div>
  )
}

export default Dashboard