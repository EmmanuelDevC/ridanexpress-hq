// src/pages/seller/Products.js
import React, { useState, useEffect } from 'react';
import {
    FaEdit,
    FaEye,
    FaTrash,
    FaPlus,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaSearch,
    FaShoppingBag,
    FaBox,
    FaLayerGroup
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Pagination from '../Pagination';
import { get_products } from '../../store/Reducers/productReducer';

const Products = () => {
    const dispatch = useDispatch();
    const { products, totalProduct } = useSelector(state => state.product);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        };
        dispatch(get_products(obj));
    }, [searchValue, currentPage, parPage, dispatch]);

    useEffect(() => {
        if (products) {
            setIsLoading(false);
        }
    }, [products]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusBadge = (status, reason = '') => {
        switch (status) {
            case 'pending':
                return (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-xs font-medium">
                        <FaClock className="text-xs" /> Pending
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                        <FaCheckCircle className="text-xs" /> Approved
                    </div>
                );
            case 'rejected':
                return (
                    <div
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-medium cursor-help relative group"
                        title={reason ? `Reason: ${reason}` : 'Rejected'}
                    >
                        <FaTimesCircle className="text-xs" /> Rejected
                        {reason && (
                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-0 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-xl z-10 text-xs text-gray-600">
                                <div className="font-semibold text-red-600 mb-1">Rejection Reason:</div>
                                {reason}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 text-xs font-medium">
                        Unknown
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Product Inventory
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Manage your product listings and track their status
                            </p>
                        </div>
                        
                        <Link
                            to="/seller/dashboard/add-product"
                            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg px-6 py-3 transition-all duration-200 shadow hover:shadow-lg"
                        >
                            <FaPlus className="text-sm" /> Add New Product
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalProduct}</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <FaShoppingBag className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {products.filter(p => p.status === 'approved').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {products.filter(p => p.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <FaClock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {products.filter(p => p.stock === 0).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <FaTimesCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        className="w-full px-4 pl-11 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 placeholder-gray-500"
                                        placeholder="Search products..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    <div className="absolute left-4 top-3 text-gray-400">
                                        <FaSearch className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                    >
                                        <option value="name">Sort by Name</option>
                                        <option value="price">Sort by Price</option>
                                        <option value="stock">Sort by Stock</option>
                                        <option value="date">Sort by Date</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
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
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.length > 0 ? (
                                    products.map((d, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={d.images[0] || 'https://via.placeholder.com/50'}
                                                            alt={d.name}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{d.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">SKU: {d._id.slice(-8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{d.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{d.brand}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{formatCurrency(d.price)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {d.discount === 0 ? (
                                                    <span className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">None</span>
                                                ) : (
                                                    <span className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">{d.discount}% off</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${d.stock === 0 ? 'text-red-600' : d.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {d.stock} units
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(d.status || 'pending', d.rejectionReason)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/seller/dashboard/edit-product/${d._id}`}
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </Link>
                                                    <button
                                                        className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="text-gray-500">
                                                <div className="flex justify-center mb-4">
                                                    <div className="bg-gray-100 p-6 rounded-full">
                                                        <FaShoppingBag className="h-16 w-16 text-gray-400" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-xl font-semibold mb-2">No products found</p>
                                                <p className="text-gray-500 mb-6">Get started by adding your first product to the inventory</p>
                                                <Link
                                                    to="/seller/dashboard/add-product"
                                                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
                                                >
                                                    <FaPlus className="text-sm" /> Add First Product
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Product Cards */}
                    <div className="lg:hidden">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {products.map((d, i) => (
                                    <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        {/* Header with image and basic info */}
                                        <div className="flex gap-4 mb-4">
                                            <div className="flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                <img
                                                    className="h-full w-full object-cover"
                                                    src={d.images[0] || 'https://via.placeholder.com/80'}
                                                    alt={d.name}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 truncate">{d.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{d.brand}</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(d.price)}</span>
                                                    {d.discount > 0 && (
                                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {d.discount}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product details */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <FaLayerGroup className="text-gray-600 text-sm" />
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">Category</div>
                                                    <div className="text-gray-900 font-medium text-sm truncate">{d.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <FaBox className="text-gray-600 text-sm" />
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">Stock</div>
                                                    <div className={`text-sm font-medium ${d.stock === 0 ? 'text-red-600' : d.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        {d.stock} units
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and actions */}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Status</div>
                                                {getStatusBadge(d.status || 'pending', d.rejectionReason)}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/seller/dashboard/edit-product/${d._id}`}
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </Link>
                                                <button
                                                    className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-12 text-center">
                                <div className="text-gray-500">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-gray-100 p-6 rounded-full">
                                            <FaShoppingBag className="h-16 w-16 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-xl font-semibold mb-2">No products found</p>
                                    <p className="text-gray-500 mb-6">Get started by adding your first product to the inventory</p>
                                    <Link
                                        to="/seller/dashboard/add-product"
                                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
                                    >
                                        <FaPlus className="text-sm" /> Add First Product
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalProduct > parPage && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalProduct}
                                parPage={parPage}
                                showItem={3}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;