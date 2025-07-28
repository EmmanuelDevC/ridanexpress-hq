import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { messageClear, get_seller_order, seller_order_status_update } from '../../store/Reducers/OrderReducer'
import { FiPackage, FiCreditCard, FiTruck, FiMapPin } from 'react-icons/fi'

const OrderDetails = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    const { order, errorMessage, successMessage } = useSelector(state => state.order)
    const [status, setStatus] = useState('')

    useEffect(() => {
        dispatch(get_seller_order(orderId))
    }, [dispatch, orderId])

    useEffect(() => {
        if (order?.delivery_status) {
            setStatus(order.delivery_status)
        }
    }, [order])

    const status_update = (e) => {
        dispatch(seller_order_status_update({
            orderId,
            info: { status: e.target.value }
        }))
        setStatus(e.target.value)
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    const formatAddress = () => {
        if (!order?.shippingInfo) return ''
        const { address, city, phone, province, post, area } = order.shippingInfo
        return `${address}, ${city}, ${phone}, ${province}, ${post}, ${area}`
    }

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        processing: 'bg-blue-100 text-blue-800',
        warehouse: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800'
    }

    return (
        <div className='p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
            <div className='max-w-6xl mx-auto space-y-6'>
                {/* Header Section */}
                <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
                    <div>
                        <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100'>
                            Order Details
                        </h1>
                        {order?._id && (
                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                Order #{order._id} • {new Date(order.date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <select
                        onChange={status_update}
                        value={status}
                        className={`px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${statusColors[status]
                            } border-transparent font-medium text-sm cursor-pointer`}
                    >
                        <option value="pending" className="bg-white dark:bg-gray-800">Pending</option>
                        <option value="processing" className="bg-white dark:bg-gray-800">Processing</option>
                        <option value="warehouse" className="bg-white dark:bg-gray-800">Warehouse</option>
                        <option value="cancelled" className="bg-white dark:bg-gray-800">Cancelled</option>
                    </select>
                </div>

                {/* Info Cards */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Shipping Card */}
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                                <FiMapPin className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                Shipping Information
                            </h3>
                        </div>
                        <div className='space-y-2 text-gray-600 dark:text-gray-300'>
                            {order?.shippingInfo ? (
                                Object.entries(order.shippingInfo).map(([key, value]) => (
                                    <div key={key} className='flex justify-between'>
                                        <span className='font-medium capitalize'>{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-500'>No shipping information available</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                                <FiCreditCard className='w-5 h-5 text-green-600 dark:text-green-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                Payment Details
                            </h3>
                        </div>
                        <div className='space-y-3'>
                            <div className='flex justify-between'>
                                <span className='text-gray-600 dark:text-gray-300'>Status:</span>
                                <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${order?.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {order?.payment_status?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-600 dark:text-gray-300'>Total Price:</span>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                    ${order?.price?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mt-6'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                                <FiTruck className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                Delivery Options
                                +
                            </h3>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-5">
                            <button className="text-white w-full sm:w-auto px-6 sm:px-10 lg:px-20 py-3 rounded-lg font-semibold bg-indigo-700 hover:bg-indigo-800 transition-colors duration-300">
                                I'll Deliver myself (5% Commission)
                            </button>
                            <button className="text-white w-full sm:w-auto px-6 sm:px-10 lg:px-20 py-3 rounded-lg font-semibold bg-green-700 hover:bg-green-800 transition-colors duration-300">
                                Use Ridan courier (3% Commission)
                            </button>
                        </div>

                    </div>
                </section>

                {/* Products Section */}
                <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden'>
                    <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            <FiPackage className='w-5 h-5 text-purple-600' />
                            Products ({order?.products?.length || 0})
                        </h3>
                    </div>
                    <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                        {order?.products?.map((p, i) => (
                            <div
                                key={p._id || i}
                                className='flex items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'
                            >
                                <img
                                    className='w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600'
                                    src={p.images?.[0] || '/placeholder-product.jpg'}
                                    alt={p.name}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.jpg'
                                        e.target.alt = 'Product image unavailable'
                                    }}
                                />
                                <div className='ml-6 flex-1'>
                                    <h4 className='font-medium text-gray-900 dark:text-gray-100'>
                                        {p.name || 'Unnamed Product'}
                                    </h4>
                                    <div className='mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-medium'>Brand:</span>
                                            <span>{p.brand || 'N/A'}</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-medium'>Qty:</span>
                                            <span>{p.quantity}</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-medium'>Price:</span>
                                            <span>${(p.price * p.quantity)?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails