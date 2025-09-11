import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // Added state for admin check

    // Get auth state
    const { role, token } = useSelector((state) => state.auth);

    useEffect(() => {
        // Set admin status immediately
        setIsAdmin(role === 'admin');
        
        if (role !== 'admin') {
            toast.error('Admin access required');
            navigate('/admin-login');
            return;
        }

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${API_BASE_URL}/api/admin/product/${productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );
                setProduct(data.product);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                toast.error(error.response?.data?.error || "Failed to load product");
                navigate('/admin/pending-products');
            }
        };

        fetchProduct();
    }, [productId, navigate, token, role]); // Added role to dependencies

    const approveProduct = async () => {
        if (window.confirm('Are you sure you want to approve this product?')) {
            try {
                await axios.put(
                    `${API_BASE_URL}/api/admin/approve-product/${productId}`,
                    {},
                    { 
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true 
                    }
                );
                toast.success('Product approved successfully!');
                navigate('/admin/pending-products');
            } catch (error) {
                toast.error(error.response?.data?.error || "Approval failed");
            }
        }
    };

    const rejectProduct = async () => {
        if (!rejectReason) {
            toast.error('Please enter a rejection reason');
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/api/admin/reject-product/${productId}`, // Fixed endpoint path
                { reason: rejectReason },
                { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true 
                }
            );
            toast.success('Product rejected!');
            navigate('/admin/pending-products');
        } catch (error) {
            toast.error(error.response?.data?.error || "Rejection failed");
        }
    };

    // Render nothing while checking permissions
    if (role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-800">Product not found</h2>
                    <button
                        onClick={() => navigate('/admin/pending-products')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Pending Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/admin/pending-products')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <FaArrowLeft className="mr-2" /> Back to Pending Products
                </button>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                            <div className="flex items-center mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : product.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                </span>
                                <span className="ml-3 text-sm text-gray-500">
                                    Added: {new Date(product.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={approveProduct}
                                disabled={product.status === 'approved'}
                                className={`flex items-center px-4 py-2 rounded-lg ${product.status === 'approved'
                                    ? 'bg-green-300 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                <FaCheck className="mr-1" /> Approve
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Product Images</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {product.images && product.images.map((img, index) => (
                                    <div key={index} className="border rounded-lg overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-48 object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                    <p className="text-gray-900">{product.category}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                                    <p className="text-gray-900">{product.brand}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                                    <p className="text-gray-900">₦ {product.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Discount</h3>
                                    <p className="text-gray-900">{product.discount}%</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                                    <p className="text-gray-900">{product.stock} units</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Shop Name</h3>
                                    <p className="text-gray-900">{product.shopName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Seller</h3>
                                    <p className="text-gray-900">
                                        {product.sellerId?.shopName || 'N/A'} ({product.sellerId?.email || 'N/A'})
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Description</h2>
                        <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                    </div>

                    {/* Rejection Section */}
                    {product.status !== 'approved' && (
                        <div className="mt-8">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                {product.status === 'rejected' ? 'Rejection Details' : 'Reject Product'}
                            </h2>

                            {product.status === 'rejected' ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">Reason:</p>
                                    <p className="text-red-700 mt-2">{product.rejectionReason}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        rows="3"
                                    ></textarea>
                                    <button
                                        onClick={rejectProduct}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        <FaTimes className="inline mr-1" /> Reject Product
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;