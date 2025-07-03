import React from 'react'
import { Link } from 'react-router-dom'

const Pending = () => {
  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='bg-gray-900 border border-orange-500/20 rounded-xl p-6 max-w-md w-full text-center shadow-[0_0_20px_rgba(249,115,22,0.1)]'>
        <div className='mb-5 flex justify-center'>
          <div className='w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center'>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-orange-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className='text-2xl font-bold text-white mb-3'>Account Review Pending</h2>
        
        <p className='text-gray-300 mb-6 leading-relaxed'>
          Please submit your additional information and activate your FLutterwave seller account. 
          Our team will review your details and activate your seller account shortly.
        </p>
        
        <button className='w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]'>
          <Link to={'/seller/dashboard/profile'}>Complete Your Profile</Link>
        </button>
        
        <div className='mt-5 text-sm text-gray-400'>
          Need help? <span className='text-orange-400 cursor-pointer hover:underline'>Contact support</span>
        </div>
      </div>
    </div>
  )
}

export default Pending