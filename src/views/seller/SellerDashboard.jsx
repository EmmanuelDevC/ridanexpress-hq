import React, { useEffect } from 'react'
import VerifiedTwoToneIcon from '@mui/icons-material/VerifiedTwoTone';
import { Link } from 'react-router-dom'
import AssuredWorkloadSharpIcon from '@mui/icons-material/AssuredWorkloadSharp';
import CategorySharpIcon from '@mui/icons-material/CategorySharp';
import LocalMallSharpIcon from '@mui/icons-material/LocalMallSharp';
import PendingActionsSharpIcon from '@mui/icons-material/PendingActionsSharp';
import Chart from 'react-apexcharts'
import customer from '../../assets/seller.png'
import { useSelector, useDispatch } from 'react-redux'
import { get_seller_dashboard_index_data } from '../../store/Reducers/dashboardIndexReducer'
import moment from 'moment'
import { FaCircle } from 'react-icons/fa'
import { get_seller_payemt_details } from '../../store/Reducers/PaymentReducer';
import { FiArrowUpRight } from 'react-icons/fi'

// Number formatting utility function
const formatNumber = (num) => {
    if (!num) return '0'; // Handle undefined/null cases
    if (num >= 1000000) return `${Math.round(num / 1000000)}M`;
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
        series: [
            {
                name: "Orders",
                data: [34, 65, 34, 65, 34, 34, 34, 56, 23, 67, 23, 45],
                color: '#6366f1'
            },
            {
                name: "Revenue",
                data: [34, 32, 45, 32, 34, 34, 43, 56, 65, 67, 45, 78],
                color: '#ec4899'
            }
        ],
        options: {
            chart: {
                type: 'bar',
                height: 350,
                foreColor: '#d0d2d6',
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 8,
                    distributed: false
                },
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { 
                    style: { 
                        colors: '#d0d2d6',
                        fontSize: '12px'
                    } 
                }
            },
            yaxis: {
                labels: {
                    style: { 
                        colors: '#d0d2d6',
                        fontSize: '12px'
                    },
                    formatter: (val) => `₦${formatNumber(val)}`
                }
            },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: "vertical",
                    shadeIntensity: 0.5,
                    gradientToColors: ['#6366f1', '#ec4899'],
                    inverseColors: false,
                    opacityFrom: 0.8,
                    opacityTo: 0.2,
                    stops: [0, 100]
                }
            },
            grid: {
                borderColor: '#374151',
                strokeDashArray: 5,
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: '#d0d2d6' },
                fontSize: '14px',
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                }
            },
            tooltip: {
                theme: 'dark',
                y: { formatter: (val) => `₦${formatNumber(val)}` },
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            responsive: [{
                breakpoint: 640,
                options: {
                    chart: { height: 300 },
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center'
                    }
                }
            }]
        }
    }

    return (
        <div className='px-4 lg:px-8 pb-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen'>
            {/* Profile Header */}
            <div className='pt-6 pb-4'>
                <div className='bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 shadow-xl border border-slate-700'>
                    <div className='flex flex-col sm:flex-row items-center gap-6'>
                        <div className='relative'>
                            <div className='relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500'>
                                <img
                                    className='w-full h-full object-cover'
                                    src={userInfo.image || customer}
                                    alt="Profile"
                                />
                                <div className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900'></div>
                            </div>
                        </div>
                        <div className='flex-1 text-center sm:text-left'>
                            <h1 className='text-xl lg:text-2xl font-bold text-white'>
                                Welcome back, {userInfo.name}
                            </h1>
                            <p className='text-slate-400 text-sm mt-1'>
                                {userInfo.role === 'admin'
                                    ? 'Administrator Dashboard'
                                    : 'Seller Dashboard'
                                }
                            </p>
                        </div>
                        <div className='flex items-center gap-2 bg-indigo-600/20 px-4 py-2 rounded-full text-indigo-400'>
                            <VerifiedTwoToneIcon className="text-indigo-400" />
                            <span className='text-sm font-medium'>
                                {userInfo.role === 'admin' ? 'Admin' : 'Verified Seller'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        title: 'Total Income',
                        value: `₦${availableAmount}`,
                        icon: <AssuredWorkloadSharpIcon className="text-2xl" />,
                        color: 'bg-gradient-to-br from-emerald-600 to-teal-500',
                        trend: '+24%'
                    },
                    {
                        title: 'All Products',
                        value: totalProduct,
                        icon: <CategorySharpIcon className="text-2xl" />,
                        color: 'bg-gradient-to-br from-amber-600 to-orange-500',
                        trend: '+12%'
                    },
                    {
                        title: 'Total Orders',
                        value: totalOrder,
                        icon: <LocalMallSharpIcon className="text-2xl" />,
                        color: 'bg-gradient-to-br from-orange-600 to-amber-500',
                        trend: '+8%'
                    },
                    {
                        title: 'Pending Orders',
                        value: totalPendingOrder,
                        icon: <PendingActionsSharpIcon className="text-2xl" />,
                        color: 'bg-gradient-to-br from-indigo-600 to-purple-500',
                        trend: '+3%'
                    }
                ].map((card, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-slate-400">{card.title}</p>
                            <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-md`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-xl md:text-2xl font-bold text-white">
                                {formatNumber(card.value)}
                            </p>
                            <span className={`text-xs ${card.trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1`}>
                                <span className={`inline-block w-0 h-0 border-x-4 border-x-transparent ${card.trend.includes('+') ? 'border-b-[6px] border-b-emerald-400' : 'border-t-[6px] border-t-rose-400'}`}></span>
                                {card.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart & Messages */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                {/* Chart Section */}
                <div className='bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold text-white'>Monthly Performance</h2>
                        <div className='flex gap-2'>
                            <button className='text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all'>
                                Monthly
                            </button>
                            <button className='text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all'>
                                Quarterly
                            </button>
                        </div>
                    </div>
                    <Chart
                        options={chartState.options}
                        series={chartState.series}
                        type='bar'
                        height={350}
                    />
                </div>

                {/* Messages Section */}
                <div className='bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold text-white'>Recent Messages</h2>
                        <Link className='text-sm text-indigo-400 hover:text-indigo-300 transition-colors'>View All</Link>
                    </div>
                    <div className='space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar'>
                        {recentMessage.map((m, i) => (
                            <div key={i} className='bg-slate-800/30 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all'>
                                <div className='flex items-start gap-4'>
                                    <div className='relative flex-shrink-0'>
                                        {m.senderId === userInfo._id ? (
                                            <div className='w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center'>
                                                <span className='text-sm font-bold text-indigo-100'>
                                                    {userInfo.name[0]}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className='w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center'>
                                                <img className='w-6 h-6' src={customer} alt="Customer" />
                                            </div>
                                        )}
                                        <div className='absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900'></div>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <span className='text-sm font-medium text-white'>{m.senderName}</span>
                                            <span className='text-xs text-slate-500'>
                                                {moment(m.createdAt).startOf('hour').fromNow()}
                                            </span>
                                        </div>
                                        <p className='text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg'>
                                            {m.message.length > 80 ? m.message.substring(0, 80) + '...' : m.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentMessage.length === 0 && (
                            <div className='text-center py-8'>
                                <div className='inline-block p-4 rounded-full bg-slate-800/50 mb-3'>
                                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-indigo-700/30 to-purple-700/30 flex items-center justify-center'>
                                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <p className='text-slate-400'>No messages yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
                    <Link
                        to="/seller/dashboard/orders"
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                        View All
                        <FiArrowUpRight />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-slate-800/30">
                            <tr>
                                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-indigo-400">Order ID</th>
                                <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-indigo-400">Amount</th>
                                <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-medium text-indigo-400 hidden sm:table-cell">Payment</th>
                                <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-medium text-indigo-400">Status</th>
                                <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-indigo-400">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">
                                                    #{d._id.substring(d._id.length - 8)}
                                                </span>
                                                <span className="text-xs text-slate-500 mt-1">
                                                    {new Date(d.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-sm text-slate-300 text-right font-medium">
                                            ${formatNumber(d.price)}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${d.payment_status === 'paid'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {d.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${d.delivery_status === 'delivered'
                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                : 'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {d.delivery_status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <Link
                                                to={`/seller/dashboard/order/details/${d._id}`}
                                                className="inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium transition-colors shadow-md hover:shadow-indigo-500/30"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className='px-4 md:px-6 py-12 text-center'>
                                        <div className='flex flex-col items-center justify-center text-gray-500'>
                                            <LocalMallSharpIcon className='text-4xl mb-3 text-gray-600' />
                                            <p>No recent orders</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style jsx>{`
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

export default SellerDashboard