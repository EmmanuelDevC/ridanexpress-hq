import React, { useState, useEffect } from 'react'
import { MdKeyboardArrowDown, MdSearch, MdOutlineReceiptLong } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Pagination from '../Pagination'
import { useSelector, useDispatch } from 'react-redux'
import { get_admin_orders } from '../../store/Reducers/OrderReducer'

const Orders = () => {
    const dispatch = useDispatch()
    const { totalOrder, myOrders } = useSelector(state => state.order)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(10)
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        dispatch(get_admin_orders({
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }))
    }, [parPage, currentPage, searchValue])

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'pending':
                return 'bg-amber-500/20 text-amber-400'
            case 'processing':
                return 'bg-blue-500/20 text-blue-400'
            case 'cancelled':
                return 'bg-rose-500/20 text-rose-400'
            default:
                return 'bg-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 md:p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl'>
                <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
                    <h2 className='text-xl font-bold text-white'>Order Management</h2>
                    
                    <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
                        <div className='relative w-full md:w-64'>
                            <input 
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white'
                                type="text" 
                                placeholder='Search orders...'
                            />
                            <MdSearch className='absolute left-3 top-3 text-gray-400 text-xl' />
                        </div>
                        
                        <div className='flex items-center'>
                            <span className='mr-2 text-gray-300'>Show:</span>
                            <select 
                                onChange={(e) => setParPage(parseInt(e.target.value))} 
                                className='px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white'
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="20">20</option>
                                <option value="25">25</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className='relative overflow-x-auto rounded-lg border border-gray-700'>
                    <table className='w-full text-sm'>
                        <thead className='text-xs text-gray-300 uppercase bg-gray-750'>
                            <tr>
                                <th scope='col' className='px-4 py-3 text-left'>Order ID</th>
                                <th scope='col' className='px-4 py-3 text-left hidden md:table-cell'>Date</th>
                                <th scope='col' className='px-4 py-3 text-right'>Amount</th>
                                <th scope='col' className='px-4 py-3 text-center hidden sm:table-cell'>Payment</th>
                                <th scope='col' className='px-4 py-3 text-center'>Status</th>
                                <th scope='col' className='px-4 py-3 text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-gray-300'>
                            {myOrders.length > 0 ? (
                                myOrders.map((o) => (
                                    <React.Fragment key={o._id}>
                                        <tr 
                                            className={`border-b border-gray-700 hover:bg-gray-750/50 transition-colors ${expandedOrder === o._id ? 'bg-gray-750/30' : ''}`}
                                        >
                                            <td className='px-4 py-3 font-medium'>
                                                <div className='flex items-center gap-2'>
                                                    <MdOutlineReceiptLong className='text-blue-400 text-xl' />
                                                    <span className='font-mono text-xs md:text-sm'>#{o._id.substring(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className='px-4 py-3 hidden md:table-cell'>
                                                {new Date(o.date).toLocaleDateString()}
                                            </td>
                                            <td className='px-4 py-3 text-right font-medium'>
                                                ${o.price.toFixed(2)}
                                            </td>
                                            <td className='px-4 py-3 text-center hidden sm:table-cell'>
                                                <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(o.payment_status)}`}>
                                                    {o.payment_status}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 text-center'>
                                                <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(o.delivery_status)}`}>
                                                    {o.delivery_status}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 text-center'>
                                                <div className='flex justify-center items-center gap-3'>
                                                    <Link 
                                                        to={`/admin/dashboard/order/details/${o._id}`}
                                                        className='text-blue-400 hover:text-blue-300 transition-colors text-sm'
                                                    >
                                                        View
                                                    </Link>
                                                    <button 
                                                        onClick={() => toggleOrder(o._id)}
                                                        className={`p-1 rounded-full hover:bg-gray-700 transition-transform ${expandedOrder === o._id ? 'rotate-180' : ''}`}
                                                    >
                                                        <MdKeyboardArrowDown className='text-xl' />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {expandedOrder === o._id && o.suborder.length > 0 && (
                                            <tr className='bg-gray-750/30 border-b border-gray-700'>
                                                <td colSpan="6" className='p-4'>
                                                    <div className='ml-4 md:ml-8'>
                                                        <h3 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                                                            <span>Suborders</span>
                                                            <span className='text-xs bg-gray-700 px-2 py-1 rounded-full'>
                                                                {o.suborder.length}
                                                            </span>
                                                        </h3>
                                                        <div className='overflow-x-auto'>
                                                            <table className='w-full text-xs md:text-sm'>
                                                                <thead className='text-gray-400 bg-gray-800'>
                                                                    <tr>
                                                                        <th className='px-3 py-2 text-left'>Suborder ID</th>
                                                                        <th className='px-3 py-2 text-right'>Amount</th>
                                                                        <th className='px-3 py-2 text-center hidden sm:table-cell'>Payment</th>
                                                                        <th className='px-3 py-2 text-center'>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {o.suborder.map((so, i) => (
                                                                        <tr key={i} className='border-b border-gray-700 last:border-0'>
                                                                            <td className='px-3 py-2.5 font-mono text-xs md:text-sm'>
                                                                                #{so._id.substring(0, 8)}
                                                                            </td>
                                                                            <td className='px-3 py-2.5 text-right'>
                                                                                ${so.price.toFixed(2)}
                                                                            </td>
                                                                            <td className='px-3 py-2.5 text-center hidden sm:table-cell'>
                                                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(so.payment_status)}`}>
                                                                                    {so.payment_status}
                                                                                </span>
                                                                            </td>
                                                                            <td className='px-3 py-2.5 text-center'>
                                                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(so.delivery_status)}`}>
                                                                                    {so.delivery_status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className='px-4 py-12 text-center'>
                                        <div className='flex flex-col items-center justify-center text-gray-400'>
                                            <MdOutlineReceiptLong className='text-4xl mb-3 text-gray-600' />
                                            <p>No orders found</p>
                                            {searchValue && (
                                                <button 
                                                    onClick={() => setSearchValue('')}
                                                    className='mt-3 text-sm text-blue-400 hover:text-blue-300'
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {totalOrder > parPage && (
                    <div className='w-full flex justify-center mt-6'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalOrder}
                            parPage={parPage}
                            showItem={Math.min(5, Math.ceil(totalOrder / parPage))}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders