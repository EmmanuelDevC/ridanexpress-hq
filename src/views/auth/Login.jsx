import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AiOutlineGooglePlus, AiOutlineGithub } from 'react-icons/ai'
import { FiFacebook } from 'react-icons/fi'
import { CiTwitter } from 'react-icons/ci'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { PropagateLoader } from 'react-spinners'
import { overrideStyle } from '../../utils/utils'
import { messageClear, seller_login } from '../../store/Reducers/authReducer'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth)
    const [state, setSatate] = useState({
        email: '',
        password: ''
    })
    
    const inputHandle = (e) => {
        setSatate({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    
    const submit = (e) => {
        e.preventDefault()
        dispatch(seller_login(state))
    }
    
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            navigate('/')
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage])
    
    return (
        <div className='min-w-screen min-h-screen bg-black flex justify-center items-center relative overflow-hidden'>
            {/* Floating "ridan" background element */}
            <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
                <div className='absolute animate-float opacity-5 blur-[8px]'>
                    <span className='text-[300px] md:text-[400px] font-black text-orange-500'>ridan</span>
                </div>
            </div>
            
            <div className='w-[350px] text-white p-2 relative z-10'>
                <div className='bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-70'>
                    <h2 className='text-2xl font-bold mb-1 text-center'>WELCOME BACK</h2>
                    <p className='text-gray-400 text-sm mb-5 text-center'>Sign in to continue your business</p>
                    
                    <form onSubmit={submit}>
                        <div className='flex flex-col w-full gap-2 mb-4'>
                            <label htmlFor="email" className='text-gray-300'>Email</label>
                            <input 
                                onChange={inputHandle} 
                                value={state.email} 
                                className='px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-white focus:ring-0 text-white' 
                                type="text" 
                                name='email' 
                                placeholder='Enter your email' 
                                id='email' 
                                required 
                            />
                        </div>
                        
                        <div className='flex flex-col w-full gap-2 mb-5'>
                            <label htmlFor="password" className='text-gray-300'>Password</label>
                            <input 
                                onChange={inputHandle} 
                                value={state.password} 
                                className='px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-white focus:ring-0 text-white' 
                                type="password" 
                                name='password' 
                                placeholder='Enter password' 
                                id='password' 
                                required 
                            />
                        </div>
                        
                        <button 
                            disabled={loader} 
                            className='w-full bg-white text-black font-medium rounded-lg px-7 py-3 mb-4 hover:bg-gray-200 transition-colors disabled:opacity-70'
                        >
                            {loader ? <PropagateLoader color='#000' cssOverride={overrideStyle} /> : 'SIGN IN'}
                        </button>
                        
                        <div className='text-center mb-5 text-gray-400'>
                            Don't have an account? 
                            <Link to='/register' className='text-white ml-1 hover:underline'>
                                Sign up
                            </Link>
                        </div>
                        
                        <div className='flex items-center mb-5'>
                            <div className='flex-grow border-t border-gray-700'></div>
                            <span className='mx-4 text-gray-500 text-sm'>OR CONTINUE WITH</span>
                            <div className='flex-grow border-t border-gray-700'></div>
                        </div>
                        
                        <div className='flex justify-center items-center gap-4'>
                            {[
                                <AiOutlineGooglePlus className='text-xl' />,
                                <FiFacebook className='text-xl' />,
                                <CiTwitter className='text-xl' />,
                                <AiOutlineGithub className='text-xl' />
                            ].map((icon, index) => (
                                <button 
                                    key={index} 
                                    type='button'
                                    className='w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors'
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Animation style for floating text */}
            <style jsx>{`
                @keyframes float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(-10px, -15px) rotate(-2deg); }
                    66% { transform: translate(15px, 10px) rotate(3deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                .animate-float {
                    animation: float 15s infinite ease-in-out;
                }
            `}</style>
        </div>
    )
}

export default Login