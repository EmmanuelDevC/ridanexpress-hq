import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IoMdClose, IoIosSend } from 'react-icons/io';
import { FaList, FaUserAlt, FaStore, FaReply, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_customers, messageClear, get_customer_message, send_message, updateMessage } from '../../store/Reducers/chatReducer';
import { BsSearch } from 'react-icons/bs';
import { FiImage, FiPaperclip, FiPackage, FiFileText, FiSettings } from 'react-icons/fi';
import ProductSelector from '../seller/ProductSelector';
import AutoReplyConfig from '../seller/AutoReplyConfig';
import StorePreview from '../seller/StorePreview';
import io from 'socket.io-client';
import { api_url } from '../../utils/utils';

// Base64 encoded sound files
const sentSound = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PD///////////////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAADwk1ZoAQAAADghh8Dg8CAgICA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OA==";
const receivedSound = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PD///////////////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAADQaWR2AQAAADghh8Dg8CAgICA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OA==";

// Create a stable socket connection with reconnection logic
const createSocketConnection = () => {
  return io(api_url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    forceNew: true
  });
};

// Format time function - handles multiple timestamp properties
const formatTime = (message) => {
  const timestamp = message.time || message.timestamp || message.createdAt;
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Helper function to create consistent chat room IDs
const getChatRoomId = (id1, id2) => {
  // Sort IDs to ensure consistent room naming regardless of sender/receiver order
  const sortedIds = [id1, id2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

const SellerToCustomer = () => {
  const scrollRef = useRef();
  const { userInfo } = useSelector(state => state.auth);
  const { customers, currentCustomer, messages, successMessage, activeCustomer } = useSelector(state => state.chat);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const { customerId } = useParams();
  const [show, setShow] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [file, setFile] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showAutoReplyConfig, setShowAutoReplyConfig] = useState(false);
  const [storePreview, setStorePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingCustomer, setTypingCustomer] = useState(null);
  const typingTimeoutRef = useRef();
  const sentAudioRef = useRef(null);
  const receivedAudioRef = useRef(null);
  const lastMessageRef = useRef('');
  const messagesContainerRef = useRef(null);

  // Play sent message sound
  const playSentSound = () => {
    if (sentAudioRef.current) {
      sentAudioRef.current.currentTime = 0;
      sentAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  // Play received message sound
  const playReceivedSound = () => {
    if (receivedAudioRef.current) {
      receivedAudioRef.current.currentTime = 0;
      receivedAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  useEffect(() => {
    dispatch(get_customers(userInfo._id));
    if (userInfo.shopInfo) {
      setStorePreview({
        name: userInfo.shopInfo.shopName,
        rating: userInfo.rating || 4.5,
        image: userInfo.image
      });
    }
  }, [userInfo, dispatch]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = createSocketConnection();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit("add_seller", userInfo._id, userInfo);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Listen for active customers
    newSocket.on('active_customers', (customers) => {
      // Update your state with active customers
    });

    // Listen for new messages
    newSocket.on('receive_message', (msg) => {
      // Check if this is a duplicate of our own message
      const isDuplicate = lastMessageRef.current === msg.text &&
        msg.senderId === userInfo._id;

      if (!isDuplicate) {
        // Ensure message has consistent timestamp property
        const processedMsg = {
          ...msg,
          time: msg.time || msg.timestamp || msg.createdAt
        };
        dispatch(updateMessage(processedMsg));
        playReceivedSound();
      } else {
        lastMessageRef.current = '';
      }
    });

    // Listen for typing indicators
    newSocket.on('typing_indicator', (data) => {
      if (data.senderId === customerId) {
        setTypingCustomer(data.isTyping ? currentCustomer : null);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [userInfo, dispatch, customerId, currentCustomer]);

  // Join chat room when customerId changes - USING CONSISTENT ROOM NAMING
  useEffect(() => {
    if (socket && customerId && userInfo) {
      const chatId = getChatRoomId(customerId, userInfo._id);
      socket.emit('join_chat', chatId);
      console.log('Seller joined chat room:', chatId);
    }
  }, [socket, customerId, userInfo]);

  useEffect(() => {
    if (customerId) {
      dispatch(get_customer_message(customerId));
    }
  }, [customerId, dispatch]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, typingCustomer]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) {
      toast.error('Message cannot be empty');
      return;
    }

    // Store the message to check for duplicates
    lastMessageRef.current = text;

    const messageData = {
      senderId: userInfo._id,
      receverId: customerId,
      text,
      name: userInfo?.shopInfo?.shopName,
      image: file
    };

    dispatch(send_message(messageData));

    // Emit socket event for real-time delivery
    if (socket && isConnected) {
      socket.emit("send_seller_message", {
        ...messageData,
        timestamp: new Date().toISOString()
      });
    }

    // Stop typing indicator
    if (socket && isTyping) {
      socket.emit('typing_stop', {
        senderId: userInfo._id,
        receverId: customerId
      });
      setIsTyping(false);
    }

    setText('');
    setFile(null);
    playSentSound();
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setText(e.target.value);

    // Send typing indicator
    if (socket && customerId && !isTyping) {
      socket.emit('typing_start', {
        senderId: userInfo._id,
        receverId: customerId
      });
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        socket.emit('typing_stop', {
          senderId: userInfo._id,
          receverId: customerId
        });
        setIsTyping(false);
      }
    }, 1000);
  };

  const sendProduct = (product) => {
    const messageData = {
      senderId: userInfo._id,
      receverId: customerId,
      name: userInfo?.shopInfo?.shopName,
      type: 'product',
      content: {
        id: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        discount: product.discount,
        stock: product.stock
      }
    };

    dispatch(send_message(messageData));

    // Emit socket event for real-time delivery
    if (socket && isConnected) {
      socket.emit("send_seller_message", {
        ...messageData,
        timestamp: new Date().toISOString()
      });
    }

    setShowProductSelector(false);
    playSentSound();
  };

  const sendInvoice = (invoiceData) => {
    const messageData = {
      senderId: userInfo._id,
      receverId: customerId,
      name: userInfo?.shopInfo?.shopName,
      type: 'invoice',
      content: {
        id: Date.now().toString(),
        items: invoiceData.items,
        total: invoiceData.total,
        paymentLink: `/payment/${Date.now()}`
      }
    };

    dispatch(send_message(messageData));

    // Emit socket event for real-time delivery
    if (socket && isConnected) {
      socket.emit("send_seller_message", {
        ...messageData,
        timestamp: new Date().toISOString()
      });
    }

    // setShowInvoiceForm(false);
    playSentSound();
  };

  useEffect(() => {
    if (successMessage) {
      dispatch(messageClear());
    }
  }, [successMessage, dispatch]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-sm" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 text-sm" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400 text-sm" />);
    }

    return stars;
  };

  return (
    <div className='lg:px-4 bg-gradient-to-b from-slate-900 to-gray-900 overflow-y-hidden'>
      {/* Audio elements for notifications */}
      <audio ref={sentAudioRef} src={sentSound} preload="auto" />
      <audio ref={receivedAudioRef} src={receivedSound} preload="auto" />

      {/* Connection Status Indicator */}
      {/* <div className="absolute top-2 right-2 z-50">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {isConnected ? '● Connected' : '● Connecting...'}
        </div>
      </div> */}

      <div className='max-w-6xl mx-auto h-[90vh] relative overflow-hidden shadow-2xl flex'>
        {/* Customer List Sidebar */}
        <div className={`w-full md:w-80 h-full bg-gray-800 border-r border-gray-700 z-50 absolute md:relative transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
                  className={`flex items-center gap-4 p-3 hover:bg-gray-750/50 transition-colors ${customerId === c.fdId ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30' : ''}`}
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
                  <div className='w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                    <FaUserAlt className='text-white' />
                  </div>
                  {activeCustomer.some(a => a.customerId === currentCustomer?._id) && (
                    <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900'></div>
                  )}
                </div>
                <div>
                  <h2 className='font-semibold tex-sm text-white'>{currentCustomer?.name}</h2>
                  <p className='text-xs text-indigo-400 flex items-center gap-1'>
                    <span className={`w-2 h-2 rounded-full ${activeCustomer.some(a => a.customerId === currentCustomer?._id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {activeCustomer.some(a => a.customerId === currentCustomer?._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* {storePreview && (
                  <StorePreview
                    name={storePreview.name}
                    rating={storePreview.rating}
                    image={storePreview.image}
                    sellerId={userInfo._id}
                  />
                )} */}
                <button
                  onClick={() => setShow(true)}
                  className='md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors'
                >
                  <FaList />
                </button>
              </div>
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

          {/* Typing Indicator */}
          {typingCustomer && (
            <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center">
              <div className="typing-dots flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              {typingCustomer.name} is typing...
            </div>
          )}

          {/* Messages Container */}
          <div ref={messagesContainerRef} className='flex-1 pb-[8rem] overflow-y-auto p-4 bg-gradient-to-b from-gray-900/50 to-gray-850/50 custom-scrollbar'>
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
                            ) : m.type === 'product' ? (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 max-w-xs">
                                <img
                                  src={m.content.image}
                                  alt={m.content.name}
                                  className="w-full h-40 object-contain mb-2"
                                />
                                <h3 className="font-semibold text-gray-800">{m.content.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-lg font-bold text-indigo-600">${m.content.price}</p>
                                  {m.content.discount > 0 && (
                                    <span className="text-sm line-through text-gray-500">${m.content.price + m.content.discount}</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{m.content.stock} in stock</p>
                              </div>
                            ) : m.type === 'invoice' ? (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 max-w-xs">
                                <h3 className="font-bold text-lg border-b pb-2">Invoice #{m.content.id}</h3>
                                <div className="my-3">
                                  {m.content.items.map((item, index) => (
                                    <div key={index} className="flex justify-between py-1">
                                      <span>{item.name} x {item.quantity}</span>
                                      <span>${item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2">
                                  <span>Total:</span>
                                  <span>${m.content.total}</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className='text-white text-sm'>{m.text || m.message || m.content}</p>
                                <div className='text-left mt-1 text-xs text-gray-500'>
                                  {formatTime(m)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Sent Message (Seller)
                      <div key={i} ref={i === messages.length - 1 ? scrollRef : null} className='flex justify-end'>
                        <div className='flex items-start gap-3 max-w-[85%]'>
                          <div className='bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl rounded-tr-none px-4 py-3 relative'>
                            <div className='absolute -right-1.5 top-0 w-3 h-3 bg-blue-600 clip-triangle-right'></div>
                            {m.type === 'product' ? (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 max-w-xs">
                                <img
                                  src={m.content.image}
                                  alt={m.content.name}
                                  className="w-full h-40 object-contain mb-2"
                                />
                                <h3 className="font-semibold text-gray-800">{m.content.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-lg font-bold text-indigo-600">${m.content.price}</p>
                                  {m.content.discount > 0 && (
                                    <span className="text-sm line-through text-gray-500">${m.content.price + m.content.discount}</span>
                                  )}
                                </div>
                              </div>
                            ) : m.type === 'invoice' ? (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 max-w-xs">
                                <h3 className="font-bold text-lg border-b pb-2">Invoice #{m.content.id}</h3>
                                <div className="my-3">
                                  {m.content.items.map((item, index) => (
                                    <div key={index} className="flex justify-between py-1">
                                      <span>{item.name} x {item.quantity}</span>
                                      <span>${item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2">
                                  <span>Total:</span>
                                  <span>${m.content.total}</span>
                                </div>
                              </div>
                            ) : m.image ? (
                              <div className='mt-2'>
                                <img
                                  src={m.image}
                                  alt="Attachment"
                                  className='max-w-full max-h-64 rounded-lg object-contain'
                                />
                                <div className='text-right mt-1 text-xs text-blue-200'>
                                  {formatTime(m)}
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className='text-white text-sm'>{m.text || m.message || m.content}</p>
                                <div className='text-right mt-1 text-xs text-blue-200'>
                                  {formatTime(m)}
                                </div>
                              </>
                            )}
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
                        {/* <BsEmojiSmile className='text-4xl text-indigo-500' /> */}
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
        </div>
        <div className='px-2 py-6 pl-3 lg:pl-[35%] md:pl-[35%] w-full absolute rounded- bottom-0 z-50 bg-gray-900'>
          <form onSubmit={send} className='flex gap-3'>
            <div className='flex items-center gap-1'>
              <button
                type="button"
                onClick={() => setShowProductSelector(true)}
                className='p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition'
                title="Select Product"
              >
                <FiPackage className='text-xl' />
              </button>

              {/* <button 
                  type="button"
                  onClick={() => setShowAutoReplyConfig(true)}
                  className='p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition'
                  title="Auto-Reply Settings"
                >
                  <FiSettings className='text-xl' />
                </button> */}

              {/* <label className='flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors cursor-pointer'>
                  <FiPaperclip className='text-xl' />
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className='hidden' 
                    accept='image/*,video/*'
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
                )} */}
            </div>

            <input
              value={text}
              onChange={handleInputChange}
              readOnly={!customerId}
              className='flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
              type="text"
              placeholder={customerId ? 'Type your message...' : 'Select a customer to chat'}
            />

            <button
              disabled={!customerId || (!text.trim() && !file)}
              className={`flex items-center justify-center w-12 h-12 rounded-xl ${customerId && (text.trim() || file)
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 cursor-pointer'
                : 'bg-gray-700 cursor-not-allowed'
                } text-white transition-colors`}
            >
              <IoIosSend className='text-xl' />
            </button>
          </form>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <ProductSelector
              onSelect={sendProduct}
              onClose={() => setShowProductSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Auto-Reply Config Modal */}
      {showAutoReplyConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <AutoReplyConfig
              sellerId={userInfo._id}
              onClose={() => setShowAutoReplyConfig(false)}
            />
          </div>
        </div>
      )}

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
        .typing-dots div {
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-name: bounce;
          animation-timing-function: ease-in-out;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default SellerToCustomer;