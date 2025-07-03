import React, { useEffect, useState, useRef } from 'react'
import { IoMdClose } from 'react-icons/io'
import { FaPaperPlane, FaEllipsisV } from 'react-icons/fa'
import { HiOutlineEmojiHappy } from 'react-icons/hi'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { get_sellers } from '../../store/Reducers/chatReducer'
import adminImage from '../../assets/admin.jpg'
import sellerImage from '../../assets/seller.png'
import toast from 'react-hot-toast'
import { send_message_seller_admin, messageClear, get_admin_message, updateSellerMessage } from '../../store/Reducers/chatReducer'
import { socket } from '../../utils/utils'

const ChatSeller = () => {
    const scrollRef = useRef()
    const { sellerId } = useParams()
    const dispatch = useDispatch()
    const { sellers, activeSellers, seller_admin_message, currentSeller, successMessage } = useSelector(state => state.chat)
    const { userInfo } = useSelector(state => state.auth)
    const [show, setShow] = useState(false)
    const [recevedMessage, setRecevedMessage] = useState('')
    const [text, setText] = useState('')

    useEffect(() => {
        dispatch(get_sellers())
    }, [])

    const send = (e) => {
        e.preventDefault()
        if (!text.trim()) return
        
        dispatch(send_message_seller_admin({
            senderId: '',
            receverId: sellerId,
            message: text,
            senderName: 'Myshop support'
        }))
        setText('')
    }

    useEffect(() => {
        if (sellerId) {
            dispatch(get_admin_message(sellerId))
        }
    }, [sellerId])

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_message_admin_to_seller', seller_admin_message[seller_admin_message.length - 1])
            dispatch(messageClear())
        }
    }, [successMessage])

    useEffect(() => {
        socket.on('receved_seller_message', msg => {
            setRecevedMessage(msg)
        })
    }, [])

    useEffect(() => {
        if (recevedMessage) {
            if (recevedMessage.senderId === sellerId && recevedMessage.receverId === '') {
                dispatch(updateSellerMessage(recevedMessage))
            } else {
                toast.success(recevedMessage.senderName + ' sent a message')
            }
        }
    }, [recevedMessage])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [seller_admin_message])

    return (
        <div className='px-4 lg:px-0 py-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen'>
            <div className='max-w-6xl mx-auto h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row'>
                {/* Seller List Sidebar */}
                <div className={`w-full md:w-80 h-full bg-gray-850 backdrop-blur-lg border-r border-gray-700 z-20 absolute md:relative transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className='flex flex-col h-full'>
                        <div className='p-5 border-b border-gray-700'>
                            <div className='flex justify-between items-center'>
                                <h2 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500'>Active Sellers</h2>
                                <button 
                                    onClick={() => setShow(false)}
                                    className='md:hidden text-gray-400 hover:text-white transition-colors'
                                >
                                    <IoMdClose className='text-xl' />
                                </button>
                            </div>
                            <div className='mt-4 relative'>
                                <input 
                                    type="text" 
                                    placeholder='Search sellers...' 
                                    className='w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition pl-10'
                                />
                                <svg className='absolute left-3 top-3.5 text-gray-500 w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <div className='flex-1 overflow-y-auto custom-scrollbar py-2'>
                            {sellers.map((s, i) => (
                                <Link 
                                    key={i} 
                                    to={`/admin/dashboard/chat-sellers/${s._id}`}
                                    className={`flex items-center gap-4 p-4 transition-all ${sellerId === s._id ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30' : 'hover:bg-gray-800'}`}
                                >
                                    <div className='relative'>
                                        <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                                            <img 
                                                className='w-full h-full object-cover' 
                                                src={s.image || sellerImage} 
                                                alt={s.name} 
                                            />
                                            {activeSellers.some(a => a.sellerId === s._id) && (
                                                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-center'>
                                            <h3 className='text-base font-medium text-white truncate'>{s.name}</h3>
                                            <span className='text-xs text-gray-400'>2m ago</span>
                                        </div>
                                        <p className='text-xs text-gray-400 truncate mt-1'>
                                            {s.lastMessage || "Start a conversation"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            
                            {sellers.length === 0 && (
                                <div className='text-center py-8'>
                                    <div className='text-gray-400'>No sellers available</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Chat Main Area */}
                <div className='flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-gray-850'>
                    {/* Chat Header */}
                    {sellerId ? (
                        <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                            <div className='flex items-center gap-3'>
                                <div className='relative'>
                                    <div className='relative w-10 h-10 rounded-full overflow-hidden'>
                                        <img 
                                            className='w-full h-full object-cover' 
                                            src={currentSeller.image || sellerImage} 
                                            alt={currentSeller.name} 
                                        />
                                        {activeSellers.some(a => a.sellerId === sellerId) && (
                                            <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900'></div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h2 className='text-lg font-semibold text-white'>{currentSeller?.name}</h2>
                                    <p className='text-xs text-cyan-400 flex items-center gap-1'>
                                        <span className={`w-2 h-2 rounded-full ${activeSellers.some(a => a.sellerId === sellerId) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        {activeSellers.some(a => a.sellerId === sellerId) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-4'>
                                <button 
                                    onClick={() => setShow(true)}
                                    className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                </button>
                                <button className='w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400'>
                                    <FaEllipsisV className='text-gray-400' />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                            <h2 className='text-xl font-bold text-white'>Admin Chat</h2>
                            <button 
                                onClick={() => setShow(true)}
                                className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Messages Container */}
                    <div className='flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/50 to-gray-850/50 custom-scrollbar'>
                        {sellerId ? (
                            seller_admin_message.length > 0 ? (
                                <div className='space-y-6'>
                                    {seller_admin_message.map((m, i) => (
                                        m.senderId === sellerId ? (
                                            // Received Message (Seller)
                                            <div key={i} ref={i === seller_admin_message.length - 1 ? scrollRef : null} className='flex justify-start'>
                                                <div className='flex items-start gap-3 max-w-[85%]'>
                                                    <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                                                        <img 
                                                            className='w-full h-full object-cover' 
                                                            src={currentSeller?.image || sellerImage} 
                                                            alt="Seller" 
                                                        />
                                                    </div>
                                                    <div className='bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 relative'>
                                                        <div className='absolute -left-1.5 top-0 w-3 h-3 bg-gray-800 clip-triangle-left'></div>
                                                        <p className='text-white'>{m.message}</p>
                                                        <div className='text-right mt-1'>
                                                            <span className='text-xs text-gray-500'>10:42 AM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Sent Message (Admin)
                                            <div key={i} ref={i === seller_admin_message.length - 1 ? scrollRef : null} className='flex justify-end'>
                                                <div className='flex items-start gap-3 max-w-[85%]'>
                                                    <div className='bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl rounded-tr-none px-4 py-3 relative'>
                                                        <div className='absolute -right-1.5 top-0 w-3 h-3 bg-blue-600 clip-triangle-right'></div>
                                                        <p className='text-white'>{m.message}</p>
                                                        <div className='text-right mt-1'>
                                                            <span className='text-xs text-blue-200'>10:43 AM</span>
                                                        </div>
                                                    </div>
                                                    <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                                                        <img 
                                                            className='w-full h-full object-cover' 
                                                            src={userInfo.image || adminImage} 
                                                            alt="Admin" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className='h-full flex flex-col items-center justify-center'>
                                    <div className='mb-6 relative'>
                                        <div className='w-24 h-24 rounded-full bg-gradient-to-r from-cyan-900/20 to-blue-900/20 flex items-center justify-center'>
                                            <div className='w-16 h-16 rounded-full bg-gradient-to-r from-cyan-800/30 to-blue-800/30 flex items-center justify-center'>
                                                <HiOutlineEmojiHappy className='text-4xl text-cyan-500' />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className='text-xl font-bold text-white mb-2'>Start a conversation</h3>
                                    <p className='text-gray-400 max-w-md text-center'>
                                        Send your first message to {currentSeller?.name} and start collaborating
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className='h-full flex flex-col items-center justify-center'>
                                <div className='mb-6 relative'>
                                    <div className='w-24 h-24 rounded-full bg-gradient-to-r from-cyan-900/20 to-blue-900/20 flex items-center justify-center'>
                                        <div className='w-16 h-16 rounded-full bg-gradient-to-r from-cyan-800/30 to-blue-800/30 flex items-center justify-center'>
                                            <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <h3 className='text-xl font-bold text-white mb-2'>Select a Seller</h3>
                                <p className='text-gray-400 max-w-md text-center'>
                                    Choose a seller from the list to start chatting and manage your conversations
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Message Input */}
                    <div className='p-4 border-t border-gray-700 bg-gray-900/50'>
                        <form onSubmit={send} className='flex gap-3'>
                            <button className='flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'>
                                <HiOutlineEmojiHappy className='text-xl' />
                            </button>
                            <input 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                readOnly={!sellerId}
                                className='flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition'
                                type="text" 
                                placeholder={sellerId ? 'Type your message...' : 'Select a seller to chat'}
                            />
                            <button 
                                disabled={!sellerId || !text.trim()}
                                className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                                    sellerId && text.trim() 
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 cursor-pointer' 
                                        : 'bg-gray-800 cursor-not-allowed'
                                } text-white transition-all shadow-lg`}
                            >
                                <FaPaperPlane />
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

export default ChatSeller