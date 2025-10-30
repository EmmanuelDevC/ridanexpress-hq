import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AiOutlineGooglePlus, AiOutlineGithub } from 'react-icons/ai'
import { FiFacebook } from 'react-icons/fi'
import { CiTwitter } from 'react-icons/ci'
import { PropagateLoader } from 'react-spinners'
import { useDispatch, useSelector } from 'react-redux'
import { overrideStyle } from '../../utils/utils'
import { messageClear, seller_register } from '../../store/Reducers/authReducer'

const Register = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loader, errorMessage, successMessage, token } = useSelector(state => state.auth)
    const [state, setState] = useState({
        name: '',
        email: "",
        password: ''
    })
    
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    })
    
    const inputHandle = (e) => {
        const { name, value } = e.target
        setState({
            ...state,
            [name]: value
        })
        
        if (name === 'password') {
            validatePassword(value)
        }
    }
    
    const validatePassword = (password) => {
        setPasswordValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        })
    }
    
    const isPasswordValid = () => {
        return Object.values(passwordValidations).every(Boolean)
    }
    
    const submit = async (e) => {
        e.preventDefault()
        
        if (!state.name || !state.email || !state.password) {
            toast.error('Please fill in all fields');
            return;
        }
        
        if (!isPasswordValid()) {
            toast.error('Please create a stronger password');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(state.email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        try {
            await dispatch(seller_register(state)).unwrap();
        } catch (error) {
            // Error is handled in the reducer
            console.error('Registration failed:', error);
        }
    }
    
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            
            // Redirect after successful registration
            setTimeout(() => {
                if (token) {
                    navigate('/seller/dashboard');
                } else {
                    navigate('/login');
                }
            }, 2000);
        }
    }, [successMessage, token, navigate, dispatch])
    
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [errorMessage, dispatch])
    
    return (
        <div className='min-w-screen min-h-screen bg-black flex justify-center items-center relative overflow-hidden'>
            {/* Your existing JSX remains the same */}
            <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
                <div className='absolute animate-float opacity-[0.03]'>
                    <span className='text-[300px] md:text-[400px] font-black text-orange-500'>ridan</span>
                </div>
            </div>
            
            <div className='w-[350px] text-white p-2 relative z-10'>
                <div className='bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-70'>
                    <h2 className='text-2xl font-bold mb-1 text-center'>CREATE ACCOUNT</h2>
                    <p className='text-gray-400 text-sm mb-5 text-center'>Register to start your business</p>
                    
                    <form onSubmit={submit}>
                        <div className='flex flex-col w-full gap-2 mb-4'>
                            <label htmlFor="name" className='text-gray-300'>Full Name</label>
                            <input 
                                onChange={inputHandle} 
                                value={state.name} 
                                className='px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-500 focus:ring-0 text-white' 
                                type="text" 
                                name='name' 
                                placeholder='Enter your full name' 
                                id='name' 
                                required 
                                minLength="2"
                            />
                        </div>
                        
                        <div className='flex flex-col w-full gap-2 mb-4'>
                            <label htmlFor="email" className='text-gray-300'>Email</label>
                            <input 
                                onChange={inputHandle} 
                                value={state.email} 
                                className='px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-500 focus:ring-0 text-white' 
                                type="email" 
                                name='email' 
                                placeholder='Enter your email' 
                                id='email' 
                                required 
                            />
                        </div>
                        
                        <div className='flex flex-col w-full gap-2 mb-3'>
                            <label htmlFor="password" className='text-gray-300'>Password</label>
                            <input 
                                onChange={inputHandle} 
                                value={state.password} 
                                className='px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-500 focus:ring-0 text-white' 
                                type="password" 
                                name='password' 
                                placeholder='Create password' 
                                id='password' 
                                required 
                                minLength="8"
                            />
                        </div>
                        
                        {state.password && (
                            <div className='mb-5 text-xs text-gray-400 space-y-1'>
                                <div className='flex items-center'>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidations.length ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span>At least 8 characters</span>
                                </div>
                                <div className='flex items-center'>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidations.uppercase ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span>Uppercase letter</span>
                                </div>
                                <div className='flex items-center'>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidations.lowercase ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span>Lowercase letter</span>
                                </div>
                                <div className='flex items-center'>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidations.number ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span>Number</span>
                                </div>
                                <div className='flex items-center'>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidations.specialChar ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span>Special character</span>
                                </div>
                            </div>
                        )}
                        
                        <div className='flex items-center w-full gap-3 mb-5'>
                            <input 
                                className='w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500' 
                                type="checkbox" 
                                name='checkbox' 
                                id='checkbox' 
                                required 
                            />
                            <label htmlFor="checkbox" className='text-gray-400 text-sm'>
                                I agree to privacy policy & terms
                            </label>
                        </div>
                        
                        <button 
                            disabled={loader || !isPasswordValid()} 
                            className={`w-full ${!isPasswordValid() || loader ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium rounded-lg px-7 py-3 mb-4 transition-colors`}
                        >
                            {loader ? <PropagateLoader color='#fff' size={10} /> : 'SIGN UP'}
                        </button>
                        
                        <div className='text-center mb-5 text-gray-400 text-sm'>
                            Already have an account? 
                            <Link to='/login' className='text-orange-500 ml-1 hover:underline'>
                                Sign in
                            </Link>
                        </div>
                        
                        {/* Social login buttons */}
                        <div className='flex items-center mb-5'>
                            <div className='flex-grow border-t border-gray-700'></div>
                            <span className='mx-4 text-gray-500 text-xs'>OR CONTINUE WITH</span>
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

export default Register;