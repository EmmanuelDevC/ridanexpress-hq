import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { get_admin_order, admin_order_status_update, messageClear } from '../../store/Reducers/OrderReducer'

const OrderDetails = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    const { order, errorMessage, successMessage } = useSelector(state => state.order)
    console.log(order)

    useEffect(() => {
        dispatch(get_admin_order(orderId))
    }, [dispatch, orderId])

    const [status, setStatus] = useState('')
    useEffect(() => {
        if (order) setStatus(order.delivery_status)
    }, [order])

    const status_update = (e) => {
        dispatch(admin_order_status_update({ orderId, info: { status: e.target.value } }))
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

    return (
        <div className='px-4 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Order Details</h1>
                        <div className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                            Order ID: #{order?._id} • {new Date(order?.date).toLocaleDateString()}
                        </div>
                    </div>
                    <select
                        value={status}
                        onChange={status_update}
                        className='px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white'
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="placed">Placed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Left Column - Customer Info */}
                    <div className='lg:col-span-1 space-y-6'>
                        {/* Customer Card */}
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                            <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>Customer Details</h2>
                            <div className='space-y-3 text-sm'>
                                <div>
                                    <p className='font-medium text-gray-700 dark:text-gray-300'>Deliver to:</p>
                                    <p className='text-gray-900 dark:text-white'>{order?.shippingInfo?.name}</p>
                                    <p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
                                        {order?.shippingInfo?.address}<br />
                                        {order?.shippingInfo?.city}, {order?.shippingInfo?.province}<br />
                                        {order?.shippingInfo?.area}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                            <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>Payment Summary</h2>
                            <div className='space-y-3 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600 dark:text-gray-400'>Status:</span>
                                    <span className={`font-medium ${order?.payment_status === 'paid'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}>
                                        {order?.payment_status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600 dark:text-gray-400'>Total Amount:</span>
                                    <span className='font-medium text-gray-900 dark:text-white'>
                                        ${order?.price?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Products */}
                    <div className='lg:col-span-2'>
                        {/* Products Card */}
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                            <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>Order Items</h2>
                            <div className='space-y-4'>
                                {order?.products?.map((p, i) => (
                                    <div key={i} className='flex items-start border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0'>
                                        {/* <img
                                            className='w-16 h-16 object-cover rounded-md mr-4'
                                            src={p.productInfo.images[0] || '/placeholder-product.jpg'}
                                            alt={p.productInfo.name}
                                        /> */}
                                        <div className='flex-1'>
                                            <h3 className='font-medium text-gray-900 dark:text-white'>{p.name}</h3>
                                            <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                                                <p>Brand: {p.brand}</p>
                                                <p>Quantity: {p.quantity}</p>
                                                <p className='mt-1'>Price: ${(p.price * p.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suborders Section */}
                        {order?.suborder?.map((o, i) => (
                            <div key={i} className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className='font-semibold text-gray-900 dark:text-white'>Seller {i + 1} Order</h3>
                                    <span className={`px-2 py-1 rounded text-sm ${o.delivery_status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {o.delivery_status}
                                    </span>
                                </div>
                                <div className='space-y-4'>
                                    {o.products?.map((p, idx) => (
                                        <div key={idx} className='flex items-start text-sm'>
                                            <img
                                                className='w-12 h-12 object-cover rounded-md mr-3'
                                                src={p.images?.[0] || '/placeholder-product.jpg'}
                                                alt={p.name}
                                            />
                                            <div>
                                                <p className='font-medium text-gray-900 dark:text-white'>{p.name}</p>
                                                <p className='text-gray-600 dark:text-gray-400'>
                                                    {p.quantity} × ${p.price?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
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