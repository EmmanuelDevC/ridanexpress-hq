import React, { useEffect, useRef, useState } from 'react'
import { IoMdClose, IoIosSend } from 'react-icons/io'
import { FaList, FaUserAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { get_customers, messageClear, get_customer_message, send_message, updateMessage } from '../../store/Reducers/chatReducer'
import { socket } from '../../utils/utils'
import { BsEmojiSmile, BsSearch } from 'react-icons/bs'
import { FiImage, FiPaperclip } from 'react-icons/fi'

const SellerToCustomer = () => {
    const scrollRef = useRef()
    const { userInfo } = useSelector(state => state.auth)
    const { customers, currentCustomer, messages, successMessage, activeCustomer } = useSelector(state => state.chat)
    const [receverMessage, setReceverMessage] = useState('')
    const dispatch = useDispatch()
    const [text, setText] = useState('')
    const { customerId } = useParams()
    const [show, setShow] = useState(false)
    const [searchCustomer, setSearchCustomer] = useState('')
    const [file, setFile] = useState(null)

    useEffect(() => {
        dispatch(get_customers(userInfo._id))
    }, [])
    
    useEffect(() => {
        if (customerId) {
            dispatch(get_customer_message(customerId))
        }
    }, [customerId])

    const send = (e) => {
        e.preventDefault()
        if (!text.trim() && !file) {
            toast.error('Message cannot be empty')
            return
        }
        
        dispatch(send_message({
            senderId: userInfo._id,
            receverId: customerId,
            text,
            name: userInfo?.shopInfo?.shopName,
            image: file
        }))
        setText('')
        setFile(null)
    }

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_seller_message', messages[messages.length - 1])
            dispatch(messageClear())
        }
    }, [successMessage])

    useEffect(() => {
        socket.on('customer_message', msg => {
            setReceverMessage(msg)
        })
    }, [])

    useEffect(() => {
        if (receverMessage) {
            if (customerId === receverMessage.senderId && userInfo._id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage))
            }
            else {
                toast.success(receverMessage.senderName + " sent a message")
                dispatch(messageClear())
            }
        }
    }, [receverMessage])
    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchCustomer.toLowerCase())
    )

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size exceeds 5MB limit')
                return
            }
            setFile(selectedFile)
        }
    }

    return (
        <div className='px-2 lg:px-4 py-4 bg-gradient-to-b from-slate-900 to-gray-900 min-h-screen'>
            <div className='max-w-6xl mx-auto h-[calc(100vh-100px)] rounded-2xl overflow-hidden shadow-2xl flex'>
                {/* Customer List Sidebar */}
                <div className={`w-full md:w-80 h-full bg-gray-850 backdrop-blur-lg border-r border-gray-700 z-20 absolute md:relative transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className='flex flex-col h-full'>
                        <div className='p-4 md:p-5 border-b border-gray-700'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-bold text-white'>Customers</h2>
                                <button 
                                    onClick={() => setShow(false)}
                                    className='md:hidden text-gray-400 hover:text-white transition-colors'
                                >
                                    <IoMdClose className='text-xl' />
                                </button>
                            </div>
                            <div className='relative'>
                                <input
                                    type="text"
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                    placeholder='Search customers...'
                                    className='w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-white'
                                />
                                <BsSearch className='absolute left-3 top-3.5 text-gray-400' />
                            </div>
                        </div>
                        
                        <div className='flex-1 overflow-y-auto custom-scrollbar py-2'>
                            {filteredCustomers.map((c, i) => (
                                <Link 
                                    key={i} 
                                    to={`/seller/dashboard/chat-customer/${c.fdId}`}
                                    className={`flex items-center gap-4 p-3 border-b border-gray-750 hover:bg-gray-750/50 transition-colors ${customerId === c.fdId ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30' : ''}`}
                                >
                                    <div className='relative'>
                                        <div className='w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                                            <FaUserAlt className='text-white' />
                                        </div>
                                        {activeCustomer.some(a => a.customerId === c.fdId) && (
                                            <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                        )}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-center'>
                                            <h3 className='text-base font-medium text-white truncate'>{c.name}</h3>
                                        </div>
                                        <p className='text-xs text-gray-400 truncate mt-1'>
                                            {activeCustomer.some(a => a.customerId === c.fdId) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            
                            {filteredCustomers.length === 0 && (
                                <div className='text-center py-8'>
                                    <div className='text-gray-400'>No customers found</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Chat Main Area */}
                <div className='flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-gray-850'>
                    {/* Chat Header */}
                    {customerId ? (
                        <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                            <div className='flex items-center gap-3'>
                                <div className='relative'>
                                    <div className='w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                                        <FaUserAlt className='text-white' />
                                    </div>
                                    {activeCustomer.some(a => a.customerId === currentCustomer?._id) && (
                                        <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className='text-lg font-semibold text-white'>{currentCustomer?.name}</h2>
                                    <p className='text-xs text-indigo-400 flex items-center gap-1'>
                                        <span className={`w-2 h-2 rounded-full ${activeCustomer.some(a => a.customerId === currentCustomer?._id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        {activeCustomer.some(a => a.customerId === currentCustomer?._id) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShow(true)}
                                className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                            >
                                <FaList />
                            </button>
                        </div>
                    ) : (
                        <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                            <h2 className='text-xl font-bold text-white'>Customer Chat</h2>
                            <button 
                                onClick={() => setShow(true)}
                                className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                            >
                                <FaList />
                            </button>
                        </div>
                    )}
                    
                    {/* Messages Container */}
                    <div className='flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/50 to-gray-850/50 custom-scrollbar'>
                        {customerId ? (
                            messages.length > 0 ? (
                                <div className='space-y-4'>
                                    {messages.map((m, i) => (
                                        m.senderId === customerId ? (
                                            // Received Message (Customer)
                                            <div key={i} ref={i === messages.length - 1 ? scrollRef : null} className='flex justify-start'>
                                                <div className='flex items-start gap-3 max-w-[85%]'>
                                                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center flex-shrink-0'>
                                                        <FaUserAlt className='text-white text-sm' />
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
                                        ) : (
                                            // Sent Message (Seller)
                                            <div key={i} ref={i === messages.length - 1 ? scrollRef : null} className='flex justify-end'>
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
                                                        <span className='text-xs font-bold text-white'>
                                                            {userInfo?.shopInfo?.shopName?.[0] || 'S'}
                                                        </span>
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
                                    <h3 className='text-xl font-bold text-white mb-2'>Start a conversation</h3>
                                    <p className='text-gray-400 max-w-md text-center'>
                                        Send your first message to {currentCustomer?.name} and provide excellent support
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className='h-full flex flex-col items-center justify-center'>
                                <div className='mb-6 relative'>
                                    <div className='w-24 h-24 rounded-full bg-gradient-to-r from-indigo-900/20 to-blue-900/20 flex items-center justify-center'>
                                        <div className='w-16 h-16 rounded-full bg-gradient-to-r from-indigo-800/30 to-blue-800/30 flex items-center justify-center'>
                                            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <h3 className='text-xl font-bold text-white mb-2'>Select a Customer</h3>
                                <p className='text-gray-400 max-w-md text-center'>
                                    Choose a customer from the list to start chatting and provide support
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
                                readOnly={!customerId}
                                className='flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
                                type="text" 
                                placeholder={customerId ? 'Type your message...' : 'Select a customer to chat'}
                            />
                            
                            <button 
                                disabled={!customerId || (!text.trim() && !file)}
                                className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                                    customerId && (text.trim() || file) 
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

export default SellerToCustomer