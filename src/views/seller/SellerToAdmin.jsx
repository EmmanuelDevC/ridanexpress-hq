import React, { useEffect, useState, useRef } from 'react'
import { IoMdClose, IoIosSend } from 'react-icons/io'
import { FaUserAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { send_message_seller_admin, messageClear, get_seller_message, updateAdminMessage } from '../../store/Reducers/chatReducer'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from '../../utils/utils'
import adminImage from '../../assets/admin.jpg'
import sellerImage from '../../assets/seller.png'
import { BsEmojiSmile } from 'react-icons/bs'
import { FiImage, FiPaperclip } from 'react-icons/fi'

const SellerToAdmin = () => {
    const scrollRef = useRef()
    const [text, setText] = useState('')
    const dispatch = useDispatch()
    const { seller_admin_message, successMessage, activeAdmin } = useSelector(state => state.chat)
    const { userInfo } = useSelector(state => state.auth)
    const [show, setShow] = useState(false)
    const [file, setFile] = useState(null)

    useEffect(() => {
        dispatch(get_seller_message())
    }, [])

    const send = (e) => {
        e.preventDefault()
        if (!text.trim() && !file) {
            toast.error('Message cannot be empty')
            return
        }
        
        dispatch(send_message_seller_admin({
            senderId: userInfo._id,
            receverId: '',
            message: text,
            senderName: userInfo.name,
            image: file
        }))
        setText('')
        setFile(null)
    }

    useEffect(() => {
        socket.on('receved_admin_message', msg => {
            dispatch(updateAdminMessage(msg))
        })
    }, [])

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_message_seller_to_admin', seller_admin_message[seller_admin_message.length - 1])
            dispatch(messageClear())
        }
    }, [successMessage])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [seller_admin_message])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit')
                return
            }
            setFile(selectedFile)
        }
    }

    return (
        <div className='px-2 lg:px-4 py-4 bg-gradient-to-b from-slate-900 to-gray-900 min-h-screen'>
            <div className='max-w-6xl mx-auto h-[calc(100vh-100px)] rounded-2xl overflow-hidden shadow-2xl flex'>
                {/* Admin Info Sidebar */}
                <div className={`w-full md:w-80 h-full bg-gray-850 backdrop-blur-lg border-r border-gray-700 z-20 absolute md:relative transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className='flex flex-col h-full'>
                        <div className='p-4 md:p-5 border-b border-gray-700'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-bold text-white'>Support</h2>
                                <button 
                                    onClick={() => setShow(false)}
                                    className='md:hidden text-gray-400 hover:text-white transition-colors'
                                >
                                    <IoMdClose className='text-xl' />
                                </button>
                            </div>
                        </div>
                        
                        <div className='flex-1 flex flex-col items-center justify-center p-4'>
                            <div className='relative mb-4'>
                                <div className='w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                                    <img 
                                        src={adminImage} 
                                        alt="Admin" 
                                        className='w-20 h-20 rounded-full object-cover border-2 border-white'
                                    />
                                </div>
                                {activeAdmin && (
                                    <div className='absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                )}
                            </div>
                            <h3 className='text-xl font-bold text-white mb-1'>Support Team</h3>
                            <div className='flex items-center gap-1 mb-6'>
                                <span className={`w-2 h-2 rounded-full ${activeAdmin ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                <span className='text-sm text-indigo-400'>
                                    {activeAdmin ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <p className='text-gray-400 text-center max-w-xs'>
                                Contact our support team for assistance with your account or any questions
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Chat Main Area */}
                <div className='flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-gray-850'>
                    {/* Chat Header */}
                    <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <div className='w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                                    <img 
                                        src={adminImage} 
                                        alt="Admin" 
                                        className='w-8 h-8 rounded-full object-cover border border-white'
                                    />
                                </div>
                                {activeAdmin && (
                                    <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                )}
                            </div>
                            <div>
                                <h2 className='text-lg font-semibold text-white'>Support Team</h2>
                                <p className='text-xs text-indigo-400 flex items-center gap-1'>
                                    <span className={`w-2 h-2 rounded-full ${activeAdmin ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                    {activeAdmin ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShow(true)}
                            className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                        >
                            <FaUserAlt />
                        </button>
                    </div>
                    
                    {/* Messages Container */}
                    <div className='flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/50 to-gray-850/50 custom-scrollbar'>
                        {seller_admin_message.length > 0 ? (
                            <div className='space-y-4'>
                                {seller_admin_message.map((m, i) => (
                                    m.senderId === userInfo._id ? (
                                        // Sent Message (Seller)
                                        <div key={i} ref={i === seller_admin_message.length - 1 ? scrollRef : null} className='flex justify-end'>
                                            <div className='flex items-start gap-3 max-w-[85%]'>
                                                <div className='bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl rounded-tr-none px-4 py-3 relative'>
                                                    <div className='absolute -right-1.5 top-0 w-3 h-3 bg-blue-600 clip-triangle-right'></div>
                                                    {m.image ? (
                                                        <div className='mt-2'>
                                                            <img 
                                                                src={m.image} 
                                                                alt="Attachment" 
                                                                className='max-w-full max-h-64 rounded-lg object-contain'
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className='text-white'>{m.message}</p>
                                                    )}
                                                    <div className='text-right mt-1 text-xs text-blue-200'>
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0'>
                                                    {userInfo.image ? (
                                                        <img 
                                                            src={userInfo.image} 
                                                            alt="Seller" 
                                                            className='w-7 h-7 rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        <span className='text-xs font-bold text-white'>
                                                            {userInfo?.name?.[0] || 'S'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Received Message (Admin)
                                        <div key={i} ref={i === seller_admin_message.length - 1 ? scrollRef : null} className='flex justify-start'>
                                            <div className='flex items-start gap-3 max-w-[85%]'>
                                                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center flex-shrink-0'>
                                                    <img 
                                                        src={adminImage} 
                                                        alt="Admin" 
                                                        className='w-7 h-7 rounded-full object-cover'
                                                    />
                                                </div>
                                                <div className='bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 relative'>
                                                    <div className='absolute -left-1.5 top-0 w-3 h-3 bg-gray-800 clip-triangle-left'></div>
                                                    {m.image ? (
                                                        <div className='mt-2'>
                                                            <img 
                                                                src={m.image} 
                                                                alt="Attachment" 
                                                                className='max-w-full max-h-64 rounded-lg object-contain'
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className='text-white'>{m.message}</p>
                                                    )}
                                                    <div className='text-left mt-1 text-xs text-gray-500'>
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className='h-full flex flex-col items-center justify-center'>
                                <div className='mb-6 relative'>
                                    <div className='w-24 h-24 rounded-full bg-gradient-to-r from-indigo-900/20 to-blue-900/20 flex items-center justify-center'>
                                        <div className='w-16 h-16 rounded-full bg-gradient-to-r from-indigo-800/30 to-blue-800/30 flex items-center justify-center'>
                                            <BsEmojiSmile className='text-4xl text-indigo-500' />
                                        </div>
                                    </div>
                                </div>
                                <h3 className='text-xl font-bold text-white mb-2'>Contact Support</h3>
                                <p className='text-gray-400 max-w-md text-center'>
                                    Send your first message to our support team for assistance with your account
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Message Input */}
                    <div className='p-4 border-t border-gray-700 bg-gray-900/50'>
                        <form onSubmit={send} className='flex gap-3'>
                            <div className='flex items-center'>
                                <label className='flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors cursor-pointer'>
                                    <FiPaperclip className='text-xl' />
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        className='hidden' 
                                        accept='image/*'
                                    />
                                </label>
                                {file && (
                                    <div className='ml-2 flex items-center bg-gray-800 px-3 py-1.5 rounded-lg text-sm text-gray-300'>
                                        <FiImage className='mr-2 text-indigo-400' />
                                        {file.name.substring(0, 15)}...
                                        <button 
                                            type='button'
                                            onClick={() => setFile(null)} 
                                            className='ml-2 text-gray-500 hover:text-gray-300'
                                        >
                                            <IoMdClose />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <input 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className='flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
                                type="text" 
                                placeholder='Type your message...'
                            />
                            
                            <button 
                                disabled={!text.trim() && !file}
                                className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                                    text.trim() || file 
                                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 cursor-pointer' 
                                        : 'bg-gray-700 cursor-not-allowed'
                                } text-white transition-colors`}
                            >
                                <IoIosSend className='text-xl' />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .clip-triangle-left {
                    clip-path: polygon(0 0, 0% 100%, 100% 0);
                }
                .clip-triangle-right {
                    clip-path: polygon(100% 0, 0 0, 100% 100%);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3b82f6;
                }
            `}</style>
        </div>
    )
}

export default SellerToAdmin