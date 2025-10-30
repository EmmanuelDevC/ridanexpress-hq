import React, { useEffect } from 'react'
import VerifiedTwoToneIcon from '@mui/icons-material/VerifiedTwoTone';
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import customer from '../../assets/seller.png'
import { useSelector, useDispatch } from 'react-redux'
import { get_seller_dashboard_index_data } from '../../store/Reducers/dashboardIndexReducer'
import moment from 'moment'
import { get_seller_payemt_details } from '../../store/Reducers/PaymentReducer';
import { 
    FiArrowUpRight, 
    FiEye, 
    FiMessageSquare, 
    FiPackage, 
    FiTrendingUp, 
    FiUsers, 
    FiShoppingCart, 
    FiDollarSign,
    FiMail,
    FiCalendar,
    FiMapPin
} from 'react-icons/fi';
import { BsDot, BsThreeDotsVertical, BsCheckCircle, BsClock } from 'react-icons/bs';

// Number formatting utility function
const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const SellerDashboard = () => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { availableAmount } = useSelector(state => state.payment);

    useEffect(() => {
        dispatch(get_seller_payemt_details(userInfo._id));
    }, []);

    const {
        totalSale,
        totalOrder,
        totalProduct,
        totalPendingOrder,
        recentOrders,
        recentMessage
    } = useSelector(state => state.dashboardIndex)

    useEffect(() => {
        dispatch(get_seller_dashboard_index_data())
    }, [dispatch])

    const chartState = {
        series: [{
            name: "Revenue",
            data: [45000, 52000, 48000, 61000, 58000, 72000, 69000, 81000, 78000, 85000, 92000, 98000],
            color: '#10b981'
        }],
        options: {
            chart: {
                type: 'area',
                height: '100%',
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif',
                zoom: { enabled: false }
            },
            stroke: {
                curve: 'smooth',
                width: 3,
                colors: ['#10b981']
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    stops: [0, 90, 100],
                    colorStops: [
                        {
                            offset: 0,
                            color: '#10b981',
                            opacity: 0.4
                        },
                        {
                            offset: 100,
                            color: '#10b981',
                            opacity: 0.1
                        }
                    ]
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: { 
                    show: true,
                    color: '#e5e7eb'
                },
                axisTicks: { 
                    show: true,
                    color: '#e5e7eb'
                },
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif'
                    }
                },
                tooltip: { enabled: false }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    formatter: (val) => `₦${formatNumber(val)}`
                },
                min: 0,
                max: 100000
            },
            grid: {
                borderColor: '#f3f4f6',
                strokeDashArray: 4,
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                },
                y: { 
                    formatter: (val) => `₦${formatNumber(val)}`,
                    title: {
                        formatter: () => 'Revenue:'
                    }
                },
                x: {
                    formatter: (val) => `${val} 2024`
                }
            },
            markers: {
                size: 4,
                colors: ['#10b981'],
                strokeColors: '#ffffff',
                strokeWidth: 2,
                hover: { size: 6 }
            }
        }
    }

    // Enhanced message data with read status
    const enhancedMessages = recentMessage.map(msg => ({
        ...msg,
        isRead: Math.random() > 0.5,
        priority: Math.random() > 0.7 ? 'high' : 'normal'
    }));

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 lg:hidden">
                <div className='px-4 py-3'>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                <img className="w-8 h-8 rounded" src={userInfo.image || customer} alt="Profile" />
                            </div>
                            <div>
                                <h1 className='text-base font-semibold text-gray-900'>Dashboard</h1>
                                <p className='text-xs text-gray-500'>Welcome back, {userInfo.name?.split(' ')[0]}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="bg-green-50 px-3 py-1.5 rounded-full">
                                <VerifiedTwoToneIcon className="text-green-600 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4'>
                {/* Profile & Overview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
                    {/* Seller Profile Card */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm lg:col-span-1">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="relative mb-3">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-0.5 shadow-lg">
                                    <img 
                                        className="w-full h-full rounded-2xl object-cover" 
                                        src={userInfo.image || customer} 
                                        alt="Seller Profile" 
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                                    <VerifiedTwoToneIcon className="text-white text-xs" />
                                </div>
                            </div>
                            <h2 className="font-bold text-gray-900 text-base lg:text-lg truncate max-w-full px-2">{userInfo.name}</h2>
                            <p className="text-gray-600 text-xs lg:text-sm mb-2">Verified Seller</p>
                            <div className="flex items-center space-x-1 text-gray-500 text-xs">
                                <FiMapPin className="text-xs" />
                                <span>Lagos, Nigeria</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-gray-200 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs lg:text-sm">Seller Rating</span>
                                <div className="flex items-center space-x-1">
                                    <div className="flex">
                                        {[1,2,3,4,5].map((star) => (
                                            <div key={star} className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-yellow-400 rounded-sm mx-0.5"></div>
                                        ))}
                                    </div>
                                    <span className="text-gray-900 font-semibold text-xs lg:text-sm">4.8</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs lg:text-sm">Response Time</span>
                                <span className="text-gray-900 font-semibold text-xs lg:text-sm">2h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs lg:text-sm">Completed Orders</span>
                                <span className="text-gray-900 font-semibold text-xs lg:text-sm">{formatNumber(totalOrder - totalPendingOrder)}</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-xs lg:text-sm transition-colors">
                            View Full Profile
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3 lg:col-span-3">
                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-green-50 rounded-lg">
                                    <FiDollarSign className="text-green-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-green-600 bg-green-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium flex items-center">
                                    <FiTrendingUp className="mr-0.5 lg:mr-1 text-xs" />
                                    +12%
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Total Revenue</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">₦{formatNumber(availableAmount)}</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">Available for withdrawal</p>
                        </div>

                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-blue-50 rounded-lg">
                                    <FiPackage className="text-blue-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">+8%</span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Active Products</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">{formatNumber(totalProduct)}</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">Listed items</p>
                        </div>

                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-purple-50 rounded-lg">
                                    <FiShoppingCart className="text-purple-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-purple-600 bg-purple-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">+5%</span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Total Orders</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">{formatNumber(totalOrder)}</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">All time orders</p>
                        </div>

                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-orange-50 rounded-lg">
                                    <FiTrendingUp className="text-orange-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-orange-600 bg-orange-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">+3%</span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Pending Orders</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">{formatNumber(totalPendingOrder)}</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">Awaiting processing</p>
                        </div>

                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-cyan-50 rounded-lg">
                                    <FiMessageSquare className="text-cyan-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-cyan-600 bg-cyan-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">New</span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Unread Messages</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">{enhancedMessages.filter(m => !m.isRead).length}</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">Require attention</p>
                        </div>

                        <div className="bg-white rounded-xl p-3 lg:p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-1.5 lg:p-2 bg-red-50 rounded-lg">
                                    <FiUsers className="text-red-600 text-sm lg:text-base" />
                                </div>
                                <span className="text-xs text-red-600 bg-red-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-medium">98%</span>
                            </div>
                            <p className="text-gray-500 text-xs lg:text-sm">Satisfaction Rate</p>
                            <p className="text-gray-900 font-bold text-lg lg:text-xl">98%</p>
                            <p className="text-gray-400 text-xs mt-0.5 lg:mt-1">Customer feedback</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6'>
                    {/* Revenue Chart */}
                    <div className='bg-white rounded-xl p-4 lg:p-6 border border-gray-200 shadow-sm xl:col-span-2'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3'>
                            <div>
                                <h2 className='text-base lg:text-xl font-bold text-gray-900'>Revenue Analytics</h2>
                                <p className='text-gray-500 text-xs lg:text-sm'>Monthly revenue performance trends</p>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
                                    <button className='text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-md bg-white text-gray-900 shadow-sm font-medium'>Monthly</button>
                                    <button className='text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-md text-gray-600 font-medium'>Quarterly</button>
                                    <button className='text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-md text-gray-600 font-medium'>Yearly</button>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <BsThreeDotsVertical className="text-gray-500 text-sm" />
                                </button>
                            </div>
                        </div>
                        <div className="h-[200px] lg:h-[280px]">
                            <Chart
                                options={chartState.options}
                                series={chartState.series}
                                type='area'
                                height="100%"
                                width="100%"
                            />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-gray-500 text-xs lg:text-sm font-medium">This Month</p>
                                <p className="text-gray-900 font-bold text-sm lg:text-lg">₦98K</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-xs lg:text-sm font-medium">Growth Rate</p>
                                <p className="text-green-600 font-bold text-sm lg:text-lg flex items-center justify-center">
                                    <FiTrendingUp className="mr-1 text-xs" />
                                    +18.2%
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-xs lg:text-sm font-medium">Avg. Order</p>
                                <p className="text-gray-900 font-bold text-sm lg:text-lg">₦12.4K</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-xs lg:text-sm font-medium">Target</p>
                                <p className="text-gray-900 font-bold text-sm lg:text-lg">₦1.2M</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Messages Section */}
                    <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
                        <div className='p-4 lg:p-6 border-b border-gray-200'>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h2 className='font-bold text-gray-900 text-base lg:text-lg flex items-center'>
                                        <FiMessageSquare className="mr-2 text-gray-700 text-sm lg:text-base" />
                                        Customer Messages
                                    </h2>
                                    <p className='text-gray-500 text-xs lg:text-sm mt-1'>Recent customer inquiries</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                        {enhancedMessages.filter(m => !m.isRead).length} new
                                    </span>
                                    <Link className='text-green-600 hover:text-green-700 text-xs lg:text-sm font-medium flex items-center space-x-1'>
                                        <span>View All</span>
                                        <FiArrowUpRight className="text-xs" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className='p-2 max-h-[300px] lg:max-h-[400px] overflow-y-auto'>
                            {enhancedMessages.slice(0, 5).map((m, i) => (
                                <div key={i} className={`p-2 lg:p-3 rounded-lg transition-all mb-2 last:mb-0 group hover:shadow-sm ${
                                    !m.isRead ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                                }`}>
                                    <div className='flex items-start space-x-2 lg:space-x-3'>
                                        <div className='relative flex-shrink-0'>
                                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm ${
                                                m.priority === 'high' ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                            }`}>
                                                <span className='text-white text-xs lg:text-sm font-bold'>{m.senderName[0]}</span>
                                            </div>
                                            {!m.isRead && (
                                                <div className='absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-green-500 border-2 border-white'></div>
                                            )}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1'>
                                                <div className="flex items-center space-x-2">
                                                    <span className='text-sm font-semibold text-gray-900 truncate'>{m.senderName}</span>
                                                    {m.priority === 'high' && (
                                                        <span className='bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full font-medium'>Urgent</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span className='text-xs text-gray-500'>
                                                        {moment(m.createdAt).fromNow()}
                                                    </span>
                                                    {m.isRead ? (
                                                        <BsCheckCircle className="text-green-500 text-xs lg:text-sm" />
                                                    ) : (
                                                        <BsClock className="text-orange-500 text-xs lg:text-sm" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className='text-gray-600 text-xs lg:text-sm line-clamp-2 mb-2'>
                                                {m.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    m.senderId === userInfo._id 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {m.senderId === userInfo._id ? 'You' : 'Customer'}
                                                </span>
                                                <button className="text-green-600 hover:text-green-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {enhancedMessages.length === 0 && (
                                <div className='text-center py-6 lg:py-8'>
                                    <FiMessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2 lg:mb-3" />
                                    <p className='text-gray-500 text-sm font-medium'>No messages yet</p>
                                    <p className='text-gray-400 text-xs mt-1'>Customer messages will appear here</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 lg:p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button className="w-full bg-white border border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-700 font-medium py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm transition-all flex items-center justify-center space-x-2">
                                <FiMail className="text-xs lg:text-sm" />
                                <span>Compose New Message</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-16 lg:mb-0">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-gray-900 text-base lg:text-lg flex items-center">
                                    <FiShoppingCart className="mr-2 text-gray-700 text-sm lg:text-base" />
                                    Recent Orders
                                </h2>
                                <p className="text-gray-500 text-xs lg:text-sm mt-1">Latest customer orders and status</p>
                            </div>
                            <Link
                                to="/seller/dashboard/orders"
                                className="text-green-600 hover:text-green-700 text-xs lg:text-sm font-medium flex items-center space-x-2 bg-green-50 px-3 lg:px-4 py-2 rounded-lg border border-green-200 transition-colors self-start sm:self-auto"
                            >
                                <span>View All Orders</span>
                                <FiArrowUpRight className="text-xs lg:text-sm" />
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-3 lg:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="text-right py-3 px-3 lg:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-center py-3 px-3 lg:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                                    <th className="text-center py-3 px-3 lg:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-3 lg:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {recentOrders.slice(0, 8).map((d, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-3 px-3 lg:px-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-semibold text-gray-900">
                                                    #{d._id.substring(d._id.length - 6).toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                                    <FiCalendar className="mr-1 text-xs" />
                                                    {moment(d.createdAt).format('MMM D, YYYY')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 lg:px-6 text-right">
                                            <span className="text-xs lg:text-sm font-semibold text-gray-900">₦{formatNumber(d.price)}</span>
                                        </td>
                                        <td className="py-3 px-3 lg:px-6 hidden sm:table-cell">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                                                    d.payment_status === 'paid' 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                    <BsDot className={`text-base -ml-0.5 ${
                                                        d.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                                                    }`} />
                                                    {d.payment_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 lg:px-6">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                                                    d.delivery_status === 'delivered' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    d.delivery_status === 'shipped' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                    d.delivery_status === 'processing' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                                    'bg-orange-100 text-orange-800 border border-orange-200'
                                                }`}>
                                                    <BsDot className={`text-base -ml-0.5 ${
                                                        d.delivery_status === 'delivered' ? 'text-blue-500' :
                                                        d.delivery_status === 'shipped' ? 'text-purple-500' :
                                                        d.delivery_status === 'processing' ? 'text-cyan-500' : 'text-orange-500'
                                                    }`} />
                                                    {d.delivery_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 lg:px-6 text-right">
                                            <Link
                                                to={`/seller/dashboard/order/details/${d._id}`}
                                                className="inline-flex items-center text-green-600 hover:text-green-700 text-xs lg:text-sm font-medium bg-green-50 hover:bg-green-100 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-colors group-hover:bg-green-100"
                                            >
                                                <FiEye className="mr-1 lg:mr-2 text-xs lg:text-sm" />
                                                <span>View</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className='py-8 lg:py-12 text-center'>
                                            <div className='flex flex-col items-center justify-center text-gray-500'>
                                                <FiShoppingCart className='w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mb-2 lg:mb-3' />
                                                <p className="text-sm font-medium text-gray-600">No recent orders</p>
                                                <p className="text-xs text-gray-400 mt-0.5 lg:mt-1">New orders will appear here automatically</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions - Mobile Only */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-20">
                    <div className="grid grid-cols-4 gap-2">
                        <Link className="flex flex-col items-center space-y-1 p-2 rounded-lg text-green-600 bg-green-50">
                            <FiShoppingCart className="text-sm" />
                            <span className="text-xs font-medium">Orders</span>
                        </Link>
                        <Link className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-500 hover:text-gray-700">
                            <FiPackage className="text-sm" />
                            <span className="text-xs font-medium">Products</span>
                        </Link>
                        <Link className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-500 hover:text-gray-700">
                            <FiMessageSquare className="text-sm" />
                            <span className="text-xs font-medium">Messages</span>
                        </Link>
                        <Link className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-500 hover:text-gray-700">
                            <FiUsers className="text-sm" />
                            <span className="text-xs font-medium">Profile</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SellerDashboard