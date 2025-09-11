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
    FaInfoCircle
} from 'react-icons/fa'
import { GiKnightBanner } from 'react-icons/gi';
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
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusBadge = (status, reason = '') => {
        switch (status) {
            case 'pending':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-900/30 text-amber-400 rounded-md text-xs">
                        <FaClock className="text-xs" /> Pending
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-md text-xs">
                        <FaCheckCircle className="text-xs" /> Approved
                    </div>
                );
            case 'rejected':
                return (
                    <div
                        className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded-md text-xs cursor-help relative group"
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
                    <div className="px-2 py-1 bg-gray-700 rounded-md text-gray-300 text-xs">
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
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 px-4 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                            Product Inventory
                        </h1>
                        <p className="text-gray-400">
                            Manage your product listings
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-300"
                                placeholder="Search products..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <div className="absolute right-3 top-2.5 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <select
                            value={parPage}
                            onChange={(e) => setParPage(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>

                        <Link
                            to="/seller/dashboard/add-product"
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg"
                        >
                            <FaPlus /> Add Product
                        </Link>
                    </div>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                                    {/* NEW STATUS COLUMN */}
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/20 divide-y divide-gray-700/50">
                                {products.length > 0 ? (
                                    products.map((d, i) => (
                                        <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-700">
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={d.images[0] || 'https://via.placeholder.com/50'}
                                                        alt={d.name}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{d.name}</div>
                                                <div className="text-xs text-gray-400">SKU: {d._id.slice(-8)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.brand}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{formatCurrency(d.price)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {d.discount === 0 ? (
                                                    <span className="px-2 py-1 text-xs bg-gray-700 rounded-md text-gray-300">None</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-amber-900/30 text-amber-400 rounded-md">{d.discount}% off</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{d.stock}</div>
                                            </td>
                                            {/* NEW STATUS CELL */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(d.status || 'pending', d.rejectionReason)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/seller/dashboard/edit-product/${d._id}`}
                                                        className="p-2 bg-indigo-900/30 hover:bg-indigo-800/50 rounded-lg text-indigo-300 hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <Link
                                                        className="p-2 bg-emerald-900/30 hover:bg-emerald-800/50 rounded-lg text-emerald-300 hover:text-white transition-colors"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                    <button
                                                        className="p-2 bg-red-900/30 hover:bg-red-800/50 rounded-lg text-red-300 hover:text-white transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    <Link
                                                        to={`/seller/dashboard/add-banner/${d._id}`}
                                                        className="p-2 bg-cyan-900/30 hover:bg-cyan-800/50 rounded-lg text-cyan-300 hover:text-white transition-colors"
                                                        title="Add Banner"
                                                    >
                                                        <GiKnightBanner />
                                                    </Link>
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
                                                    className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg"
                                                >
                                                    <FaPlus /> Add First Product
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalProduct > parPage && (
                        <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700">
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalProduct}
                                parPage={parPage}
                                showItem={4}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;