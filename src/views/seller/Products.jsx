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
    FaEllipsisV,
    FaShoppingBag,
    FaTag,
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
    const [showMobileMenu, setShowMobileMenu] = useState(null);

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
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                        <FaClock className="text-xs" /> Pending
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-xs">
                        <FaCheckCircle className="text-xs" /> Approved
                    </div>
                );
            case 'rejected':
                return (
                    <div
                        className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs cursor-help relative group"
                        title={reason ? `Reason: ${reason}` : 'Rejected'}
                    >
                        <FaTimesCircle className="text-xs" /> Rejected
                        {reason && (
                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-0 w-64 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 text-xs text-gray-300">
                                <div className="font-medium text-red-400 mb-1">Rejection Reason:</div>
                                {reason}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="px-2 py-1 bg-gray-700 rounded-full text-gray-300 text-xs">
                        Unknown
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                            Product Inventory
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Manage your product listings
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <div className="relative w-full sm:w-56">
                            <input
                                type="text"
                                className="w-full px-4 pl-10 py-2.5 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-300 text-sm sm:text-base"
                                placeholder="Search products..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-500">
                                <FaSearch className="h-4 w-4" />
                            </div>
                        </div>

                        <div className='flex justify-between items-center gap-3 px-3'>
                            <select
                                value={parPage}
                                onChange={(e) => setParPage(e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                            >
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="20">20 per page</option>
                                <option value="50">50 per page</option>
                            </select>

                            <Link
                                to="/seller/dashboard/add-product"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg text-sm sm:text-base"
                            >
                                <FaPlus className="text-xs sm:text-sm" /> Add Product
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl shadow-lg overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Brand</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/20 divide-y divide-gray-700/50">
                                {products.length > 0 ? (
                                    products.map((d, i) => (
                                        <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-gray-700">
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={d.images[0] || 'https://via.placeholder.com/50'}
                                                        alt={d.name}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{d.name}</div>
                                                <div className="text-xs text-gray-400">SKU: {d._id.slice(-8)}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.category}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.brand}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{formatCurrency(d.price)}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {d.discount === 0 ? (
                                                    <span className="px-2 py-1 text-xs bg-gray-700 rounded-md text-gray-300">None</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-amber-900/30 text-amber-400 rounded-md">{d.discount}% off</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.stock}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getStatusBadge(d.status || 'pending', d.rejectionReason)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/seller/dashboard/edit-product/${d._id}`}
                                                        className="p-1.5 sm:p-2 bg-indigo-900/30 hover:bg-indigo-800/50 rounded-lg text-indigo-300 hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="text-sm sm:text-base" />
                                                    </Link>

                                                    <button
                                                        className="p-1.5 sm:p-2 bg-red-900/30 hover:bg-red-800/50 rounded-lg text-red-300 hover:text-white transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash className="text-sm sm:text-base" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <div className="flex justify-center mb-4">
                                                    <div className="bg-gray-800 p-4 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-lg">No products found</p>
                                                <p className="text-sm mt-2 text-gray-500">Try adding a new product or adjusting your search</p>
                                                <Link
                                                    to="/seller/dashboard/add-product"
                                                    className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg text-sm sm:text-base"
                                                >
                                                    <FaPlus className="text-xs sm:text-sm" /> Add First Product
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Product Cards */}
                    <div className="md:hidden">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 p-3">
                                {products.map((d, i) => (
                                    <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700 shadow-lg">
                                        {/* Header with image and basic info */}
                                        <div className="flex gap-4 mb-4">
                                            <div className="flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 border-gray-700 shadow-md">
                                                <img
                                                    className="h-full w-full object-cover"
                                                    src={d.images[0] || 'https://via.placeholder.com/80'}
                                                    alt={d.name}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate">{d.name}</h3>
                                                <p className="text-xs text-gray-400 mt-1">{d.brand}</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-lg font-bold text-white">{formatCurrency(d.price)}</span>
                                                    {d.discount > 0 && (
                                                        <span className="ml-2 px-2 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                                                            {d.discount}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product details */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1.5 bg-indigo-900/30 rounded-lg">
                                                    <FaLayerGroup className="text-indigo-400 text-xs" />
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-xs">Category</div>
                                                    <div className="text-gray-200 font-medium truncate">{d.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1.5 bg-emerald-900/30 rounded-lg">
                                                    <FaBox className="text-emerald-400 text-xs" />
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-xs">Stock</div>
                                                    <div className="text-gray-200 font-medium">{d.stock} units</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and actions */}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                            <div>
                                                <div className="text-xs text-gray-400 mb-1">Status</div>
                                                {getStatusBadge(d.status || 'pending', d.rejectionReason)}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/seller/dashboard/edit-product/${d._id}`}
                                                    className="p-2 bg-indigo-900/30 hover:bg-indigo-800/50 rounded-full text-indigo-300 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </Link>
                                                <button
                                                    className="p-2 bg-red-900/30 hover:bg-red-800/50 rounded-full text-red-300 hover:text-white transition-colors"
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
                                        <div className="bg-gray-800 p-4 rounded-full">
                                            <FaShoppingBag className="h-12 w-12 text-gray-600" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-lg">No products found</p>
                                    <p className="text-sm mt-2 text-gray-500">Try adding a new product or adjusting your search</p>
                                    <Link
                                        to="/seller/dashboard/add-product"
                                        className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg text-sm"
                                    >
                                        <FaPlus className="text-xs" /> Add First Product
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalProduct > parPage && (
                        <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700">
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