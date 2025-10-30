import React, { useState, useEffect, useMemo } from 'react';
import { FiEye, FiSearch, FiCalendar, FiChevronDown, FiChevronUp, FiFilter, FiRefreshCw, FiDollarSign, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { useSelector, useDispatch } from 'react-redux';
import { get_seller_orders } from '../../store/Reducers/OrderReducer';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const Orders = () => {
    const dispatch = useDispatch();
    const { totalOrder, myOrders } = useSelector(state => state.order);
    const { userInfo } = useSelector(state => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filters, setFilters] = useState({
        paymentStatus: 'all',
        deliveryStatus: 'all',
        minAmount: '',
        maxAmount: ''
    });
    
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'pending', label: 'Pending' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    useEffect(() => {
        dispatch(get_seller_orders({
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            sellerId: userInfo._id,
            filters
        }));
    }, [parPage, currentPage, searchValue, filters, dispatch, userInfo._id]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            paymentStatus: 'all',
            deliveryStatus: 'all',
            minAmount: '',
            maxAmount: ''
        });
        setSearchValue('');
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const paidOrders = myOrders.filter(o => o.payment_status === 'paid').length;
        const pendingOrders = myOrders.filter(o => o.payment_status === 'pending').length;
        
        // Calculate total value for the current page orders
        const pageTotal = myOrders.reduce((sum, order) => sum + order.price, 0);
        const pageAvg = myOrders.length > 0 ? pageTotal / myOrders.length : 0;
        
        return {
            total: totalOrder,
            paid: paidOrders,
            pending: pendingOrders,
            pageAvg
        };
    }, [myOrders, totalOrder]);

    const sortedOrders = useMemo(() => {
        return [...myOrders].sort((a, b) => {
            if (sortConfig.key === 'date') {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }
            
            if (sortConfig.key === 'price') {
                return sortConfig.direction === 'asc' ? a.price - b.price : b.price - a.price;
            }
            
            return 0;
        });
    }, [myOrders, sortConfig]);

    const statusStyles = {
        paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: FiCheckCircle },
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: FiClock },
        unpaid: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: FiClock },
        delivered: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: FiPackage },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: FiPackage }
    };

    const formatDate = dateString => {
        try {
            return dateString
                ? format(parseISO(dateString), 'MMM dd, yyyy')
                : 'N/A';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Order Management
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Manage and track your customer orders
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all text-sm font-medium"
                        >
                            <FiFilter className="text-gray-600" />
                            <span>Filters</span>
                        </button>
                        <button 
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all text-sm font-medium"
                        >
                            <FiRefreshCw className="text-gray-600" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    value={filters.paymentStatus}
                                    onChange={handleFilterChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
                                <select
                                    name="deliveryStatus"
                                    value={filters.deliveryStatus}
                                    onChange={handleFilterChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                                <input
                                    type="number"
                                    name="minAmount"
                                    value={filters.minAmount}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                                <input
                                    type="number"
                                    name="maxAmount"
                                    value={filters.maxAmount}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search and Results */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 text-sm"
                            placeholder="Search orders..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-gray-700 text-sm hidden sm:block">Show:</span>
                        <select
                            value={parPage}
                            onChange={(e) => setParPage(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table - Desktop */}
                <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                                        <div className="flex items-center">
                                            Date
                                            {sortConfig.key === 'date' && (
                                                sortConfig.direction === 'asc' ? 
                                                <FiChevronUp className="ml-1" /> : 
                                                <FiChevronDown className="ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                                        <div className="flex items-center justify-end">
                                            Amount
                                            {sortConfig.key === 'price' && (
                                                sortConfig.direction === 'asc' ? 
                                                <FiChevronUp className="ml-1" /> : 
                                                <FiChevronDown className="ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedOrders.length > 0 ? (
                                    sortedOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiCalendar className="mr-2 text-gray-500 text-sm" />
                                                    <span className="text-sm text-gray-900">
                                                        {formatDate(order.date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">#{order._id.slice(-8)}</div>
                                                {order.customer?.name && (
                                                    <div className="text-xs text-gray-600 mt-1">{order.customer.name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(order.price)}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {order.products?.length || 0} items
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[order.payment_status]?.bg} ${statusStyles[order.payment_status]?.text} border ${statusStyles[order.payment_status]?.border}`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[order.delivery_status]?.bg} ${statusStyles[order.delivery_status]?.text} border ${statusStyles[order.delivery_status]?.border}`}>
                                                    {order.delivery_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    to={`/seller/dashboard/order/details/${order._id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 hover:text-blue-800 transition-colors text-sm font-medium"
                                                >
                                                    <FiEye className="mr-1.5 text-xs" /> 
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="text-gray-500">
                                                <div className="flex justify-center mb-4">
                                                    <div className="bg-gray-100 p-4 rounded-full">
                                                        <FiSearch className="text-xl text-gray-400" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-lg font-semibold">No orders found</p>
                                                <p className="text-sm mt-2 text-gray-600">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalOrder > parPage && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalOrder}
                                parPage={parPage}
                                showItem={3}
                            />
                        </div>
                    )}
                </div>

                {/* Mobile Orders List */}
                <div className="md:hidden space-y-4">
                    {sortedOrders.length > 0 ? (
                        sortedOrders.map((order) => {
                            const PaymentIcon = statusStyles[order.payment_status]?.icon || FiDollarSign;
                            const DeliveryIcon = statusStyles[order.delivery_status]?.icon || FiPackage;
                            
                            return (
                                <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">#{order._id.slice(-8)}</div>
                                            <div className="flex items-center mt-1 text-xs text-gray-600">
                                                <FiCalendar className="mr-1" />
                                                {formatDate(order.date)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.price)}</div>
                                            <div className="text-xs text-gray-600">{order.products?.length || 0} items</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${statusStyles[order.payment_status]?.bg}`}>
                                                <PaymentIcon className={`text-sm ${statusStyles[order.payment_status]?.text}`} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-600">Payment</div>
                                                <div className={`text-xs font-medium ${statusStyles[order.payment_status]?.text}`}>
                                                    {order.payment_status}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${statusStyles[order.delivery_status]?.bg}`}>
                                                <DeliveryIcon className={`text-sm ${statusStyles[order.delivery_status]?.text}`} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-600">Status</div>
                                                <div className={`text-xs font-medium ${statusStyles[order.delivery_status]?.text}`}>
                                                    {order.delivery_status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {order.customer?.name && (
                                        <div className="text-xs text-gray-600 mb-3">
                                            Customer: {order.customer.name}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end">
                                        <Link
                                            to={`/seller/dashboard/order/details/${order._id}`}
                                            className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 hover:text-blue-800 transition-colors text-xs font-medium"
                                        >
                                            <FiEye className="mr-1.5" /> 
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <div className="text-gray-500">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-100 p-4 rounded-full">
                                        <FiSearch className="text-xl text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-gray-700 text-lg font-semibold">No orders found</p>
                                <p className="text-sm mt-2 text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Pagination for mobile */}
                    {totalOrder > parPage && (
                        <div className="px-2 py-3 bg-gray-50 border-t border-gray-200 rounded-lg">
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalOrder}
                                parPage={parPage}
                                showItem={2}
                            />
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-gray-600 text-sm mb-1">Total Orders</div>
                        <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-500 mt-1">All matching orders</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-gray-600 text-sm mb-1">Paid Orders</div>
                        <div className="text-xl font-bold text-gray-900">
                            {stats.paid}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Paid orders</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-gray-600 text-sm mb-1">Pending Orders</div>
                        <div className="text-xl font-bold text-gray-900">
                            {stats.pending}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Pending payments</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-gray-600 text-sm mb-1">Avg. Order</div>
                        <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(stats.pageAvg)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Average value</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Orders;