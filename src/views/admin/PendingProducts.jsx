import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaSearch, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../Pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PendingProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [parPage, setParPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    // Get auth state
    const { role, token } = useSelector((state) => state.auth);
    const isAdmin = role === 'admin';

    useEffect(() => {
        // Redirect if not admin
        if (!isAdmin) {
            navigate('/admin-login');
        } else {
            fetchPendingProducts();
        }
    }, [isAdmin, page, parPage, searchValue, navigate]);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${API_BASE_URL}/api/admin/pending-products?page=${page}&parPage=${parPage}&search=${searchValue}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProducts(data.products);
            setTotal(data.totalProducts);
            setLoading(false);
        } catch (error) {
            setLoading(false);

            // Handle unauthorized error
            if (error.response?.status === 403) {
                toast.error("You don't have permission to access this resource");
                navigate('/admin-login');
            } else {
                toast.error(error.response?.data?.error || "Failed to load products");
            }
        }
    };

    const approveProduct = async (id) => {
        if (window.confirm('Are you sure you want to approve this product?')) {
            try {
                await axios.put(
                    `${API_BASE_URL}/api/admin/approve-product/${id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );
                toast.success('Product approved successfully!');
                fetchPendingProducts();
            } catch (error) {
                toast.error(error.response?.data?.error || "Approval failed");
            }
        }
    };

    const rejectProduct = async (id) => {
        const reason = prompt("Please enter reason for rejection:");
        if (reason) {
            try {
                await axios.put(
                    `${API_BASE_URL}/admin/reject-product/${id}`,
                    { reason },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );
                toast.success('Product rejected!');
                fetchPendingProducts();
            } catch (error) {
                toast.error(error.response?.data?.error || "Rejection failed");
            }
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
                            Pending Product Approvals
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Review and approve new product listings
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 w-full md:w-auto flex gap-4">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent placeholder-gray-500"
                                placeholder="Search products..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        </div>

                        <select
                            value={parPage}
                            onChange={(e) => setParPage(Number(e.target.value))}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-100"
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-700">
                        <div className="flex justify-center mb-6">
                            <FaClock className="text-5xl text-violet-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-200 mb-2">
                            No pending products
                        </h3>
                        <p className="text-gray-400 mb-6">
                            All products have been reviewed and approved
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-750">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {product.images[0] && (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-700"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-100">{product.name}</div>
                                                        <div className="text-sm text-gray-400">{product.brand}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-100">{product.sellerId?.shopName || 'N/A'}</div>
                                                <div className="text-sm text-gray-400">{product.sellerId?.email || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {product.category}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-100">
                                                    ${product.price.toFixed(2)}
                                                    {product.discount > 0 && (
                                                        <span className="ml-1 text-xs text-green-400">
                                                            ({product.discount}% off)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-900 text-green-300' :
                                                    product.stock > 0 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                                    }`}>
                                                    {product.stock} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/admin/product/${product._id}`}
                                                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/30 transition-all"
                                                        title="View Details"
                                                    >
                                                        <FaEye className="inline mr-1" /> View
                                                    </Link>
                                                    <button
                                                        onClick={() => approveProduct(product._id)}
                                                        className="text-green-400 hover:text-green-300 p-1 rounded hover:bg-green-900/30 transition-all"
                                                        title="Approve"
                                                    >
                                                        <FaCheck className="inline mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectProduct(product._id)}
                                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30 transition-all"
                                                        title="Reject"
                                                    >
                                                        <FaTimes className="inline mr-1" /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {total > parPage && (
                            <div className="px-6 py-4 border-t border-gray-700">
                                <Pagination
                                    pageNumber={page}
                                    setPageNumber={setPage}
                                    totalItem={total}
                                    parPage={parPage}
                                    showItem={5}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingProducts;