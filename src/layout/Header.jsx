import React from 'react'
import { FaBell } from 'react-icons/fa'
import WidgetsIcon from '@mui/icons-material/Widgets';
import { useSelector } from 'react-redux'
import sellerImage from '../assets/seller.png'
import adminImage from '../assets/admin.jpg'
import { FaCircle } from 'react-icons/fa'

const Header = ({ showSidebar, setShowSidebar }) => {
    const { userInfo } = useSelector(state => state.auth)
    return (
        <div className='w-full sticky top-0 left-0 right-0 z-50 bg-[#161d31] border-b border-slate-700 shadow-xl'>
            <div className='px-4 lg:px-8 h-[70px] ml-0 lg:ml-[260px] flex justify-between items-center transition-all duration-300'>
                {/* Left Section */}
                <div className='flex items-center space-x-4'>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className='lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 text-slate-300'
                    >
                        <WidgetsIcon className='w-6 h-6' />
                    </button>
                    <div className='relative hidden md:block'>
                        <h2 className='text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]'>
                            Dashboard
                        </h2>
                    </div>
                </div>

                {/* Right Section */}
                <div className='flex items-center space-x-6'>
                    <button className='p-2 relative text-slate-300 hover:text-white rounded-full hover:bg-slate-700 transition-colors duration-200'>
                        <FaBell className='w-6 h-6' />
                        <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                    </button>

                    <div className='flex items-center space-x-3 group cursor-pointer'>
                        <div className='text-right hidden sm:block'>
                            <h2 className='text-sm font-semibold text-slate-200'>{userInfo.name}</h2>
                            <p className='text-xs font-medium text-slate-400'>{userInfo.role}</p>
                        </div>
                        <div className='relative'>
                            <img
                                className='w-10 h-10 rounded-full border-2 border-indigo-500 object-cover'
                                src={userInfo.image ? userInfo.image : userInfo.role === 'admin' ? adminImage : sellerImage}
                                alt="Profile"
                            />
                            <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800'></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Welcome Banner
            <div className='ml-0 lg:ml-[260px] mt-6 mb-4 px-4 lg:px-5'>
                <div className='bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl p-6 shadow-xl border border-slate-600'>
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <img
                                className='w-16 h-16 rounded-full border-2 border-indigo-500 object-cover'
                                src={userInfo.image ? userInfo.image : userInfo.role === 'admin' ? adminImage : sellerImage}
                                alt="Profile"
                            />
                            <FaCircle className='absolute bottom-1 right-1 w-3 h-3 text-green-500' />
                        </div>
                        <div>
                            <h1 className='text-lg lg:text-xl lg:font-bold text-white'>
                                Hi, {userInfo.name}
                            </h1>
                            <p className='text-slate-300 text-sm mt-1'>
                                {userInfo.role === 'admin'
                                    ? 'Administrator Dashboard Access'
                                    : 'Account Management Portal'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default Header