import React, { useState, useEffect, useMemo } from 'react';
import { FiEye, FiSearch, FiCalendar, FiChevronDown, FiChevronUp, FiFilter, FiRefreshCw } from 'react-icons/fi';
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
        paid: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        pending: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-500/30' },
        unpaid: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500/30' },
        delivered: { bg: 'bg-indigo-900/30', text: 'text-indigo-400', border: 'border-indigo-500/30' },
        cancelled: { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' }
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
            className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 px-4 lg:px-8 py-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                            Order Management
                        </h1>
                        <p className="text-gray-400">
                            Manage and track your customer orders
                        </p>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex gap-3">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700/70 rounded-lg text-gray-300 transition-all"
                        >
                            <FiFilter className="text-indigo-400" />
                            Filters
                        </button>
                        <button 
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700/70 rounded-lg text-gray-300 transition-all"
                        >
                            <FiRefreshCw className="text-indigo-400" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    value={filters.paymentStatus}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Delivery Status</label>
                                <select
                                    name="deliveryStatus"
                                    value={filters.deliveryStatus}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Min Amount</label>
                                <input
                                    type="number"
                                    name="minAmount"
                                    value={filters.minAmount}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Max Amount</label>
                                <input
                                    type="number"
                                    name="maxAmount"
                                    value={filters.maxAmount}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search and Results */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-300"
                            placeholder="Search orders by ID, customer..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm hidden sm:block">Show:</span>
                        <select
                            value={parPage}
                            onChange={(e) => setParPage(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                                        <div className="flex items-center">
                                            Date
                                            {sortConfig.key === 'date' && (
                                                sortConfig.direction === 'asc' ? 
                                                <FiChevronUp className="ml-1" /> : 
                                                <FiChevronDown className="ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                                        <div className="flex items-center justify-end">
                                            Amount
                                            {sortConfig.key === 'price' && (
                                                sortConfig.direction === 'asc' ? 
                                                <FiChevronUp className="ml-1" /> : 
                                                <FiChevronDown className="ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/20 divide-y divide-gray-700/50">
                                {sortedOrders.length > 0 ? (
                                    sortedOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-800/40 transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiCalendar className="mr-2 text-gray-500" />
                                                    <span className="text-sm text-gray-300">
                                                        {formatDate(order.date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-200">#{order._id.slice(-8)}</div>
                                                {order.customer?.name && (
                                                    <div className="text-xs text-gray-500 mt-1">{order.customer.name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-medium text-gray-200">
                                                    {formatCurrency(order.price)}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {order.products?.length || 0} items
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.payment_status]?.bg} ${statusStyles[order.payment_status]?.text} border ${statusStyles[order.payment_status]?.border}`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.delivery_status]?.bg} ${statusStyles[order.delivery_status]?.text} border ${statusStyles[order.delivery_status]?.border}`}>
                                                    {order.delivery_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    to={`/seller/dashboard/order/details/${order._id}`}
                                                    className="inline-flex items-center justify-center px-3 py-2 bg-indigo-900/30 hover:bg-indigo-800/50 rounded-lg text-indigo-300 hover:text-white transition-colors"
                                                >
                                                    <FiEye className="mr-1.5" /> 
                                                    <span className="hidden sm:inline">View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <div className="flex justify-center mb-4">
                                                    <div className="bg-gray-800 p-4 rounded-full">
                                                        <FiSearch className="text-2xl text-gray-600" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-400">No orders found</p>
                                                <p className="text-sm mt-2 text-gray-500">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalOrder > parPage && (
                        <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700">
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

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
                    <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-900/10 border border-indigo-700/30 rounded-xl p-5">
                        <div className="text-gray-400 text-sm mb-1">Total Orders</div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-indigo-400 mt-2">All matching orders</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-xl p-5">
                        <div className="text-gray-400 text-sm mb-1">Paid Orders</div>
                        <div className="text-2xl font-bold text-white">
                            {stats.paid}
                        </div>
                        <div className="text-xs text-emerald-400 mt-2">Paid orders in results</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-700/30 rounded-xl p-5">
                        <div className="text-gray-400 text-sm mb-1">Pending Orders</div>
                        <div className="text-2xl font-bold text-white">
                            {stats.pending}
                        </div>
                        <div className="text-xs text-amber-400 mt-2">Pending payments</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-700/30 rounded-xl p-5">
                        <div className="text-gray-400 text-sm mb-1">Page Avg. Order</div>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(stats.pageAvg)}
                        </div>
                        <div className="text-xs text-purple-400 mt-2">Average for current page</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Orders;