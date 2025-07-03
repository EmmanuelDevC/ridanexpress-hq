import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
    get_seller,
    seller_status_update,
    //   messageClear,
} from '../../store/Reducers/sellerReducer';
import { get_seller_dashboard_index_data } from '../../store/Reducers/dashboardIndexReducer'
import {
    FaUser, FaStore, FaMapMarkerAlt, FaIdCard,
    FaEnvelope, FaShieldAlt, FaChartLine,
    FaCreditCard, FaGlobe, FaCheck, FaTimes,
    FaEllipsisV, FaCalendarAlt
} from 'react-icons/fa';
import { get_seller_payemt_details } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${Math.round(num / 1000000)}M`;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const SellerDetails = () => {
    const dispatch = useDispatch();
    const { sellerId } = useParams();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const { availableAmount } = useSelector(state => state.payment);
    const { seller, successMessage, error } = useSelector(state => state.seller);
    const { totalPendingOrder, totalProduct } = useSelector(state => state.dashboardIndex);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    dispatch(get_seller(sellerId)),
                    dispatch(get_seller_payemt_details(sellerId)),
                    dispatch(get_seller_dashboard_index_data(sellerId))
                ]);
            } catch (err) {
                toast.error('Failed to load seller data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sellerId, dispatch]);

    const submit = (e) => {
        e.preventDefault();
        dispatch(seller_status_update({ sellerId, status }));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (error) {
            toast.error(error);
            dispatch(messageClear());
        }
    }, [successMessage, error, dispatch]);

    useEffect(() => {
        if (seller) {
            setStatus(seller.status);
        }
    }, [seller]);

    const VerificationStatus = ({ status }) => {
        if (status === 'verified') {
            return (
                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                    <FaCheck className="text-emerald-400" /> Verified
                </span>
            );
        } else if (status === 'pending') {
            return (
                <span className="flex items-center gap-2 text-amber-400 font-medium">
                    <FaShieldAlt className="text-amber-400" /> Pending
                </span>
            );
        } else {
            return (
                <span className="flex items-center gap-2 text-rose-500 font-medium">
                    <FaTimes className="text-rose-500" /> Not Verified
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-indigo-300">Loading seller details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-indigo-400">Seller Details</h1>
                        <p className="text-indigo-300/80">Manage seller account information and status</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <button className="px-4 py-2 bg-gray-800 text-indigo-400 rounded-lg font-medium border border-gray-700 hover:bg-gray-700/50 transition flex items-center gap-2">
                            <FaChartLine /> Sales Report
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
                            Export Data
                        </button>
                        <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700/50">
                            <FaEllipsisV />
                        </button>
                    </div>
                </div>

                {/* Seller Profile Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-700">
                    <div className="bg-gradient-to-r from-indigo-900/80 to-indigo-900/80 p-6 text-white">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <div className="bg-gray-900 p-1 rounded-xl shadow-lg border border-gray-700">
                                    {seller?.image ? (
                                        <img
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover"
                                            src={seller?.image}
                                            alt="Seller"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.parentNode.innerHTML = `
                          <div class="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-800 flex items-center justify-center border border-dashed border-gray-700">
                            <FaUser class="text-indigo-500 text-4xl" />
                          </div>
                        `;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-800 flex items-center justify-center border border-dashed border-gray-700">
                                            <FaUser className="text-indigo-500 text-4xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1 border-2 border-gray-900">
                                    <div className="bg-gray-800 rounded-full p-1">
                                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center">
                                            <FaUser className="text-white text-xs" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{seller?.name || 'Seller Name'}</h2>
                                <p className="mt-1 text-indigo-300">{seller?.email || 'seller@example.com'}</p>

                                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${seller?.status === 'active'
                                        ? 'bg-emerald-900 text-emerald-400'
                                        : 'bg-rose-900 text-rose-400'
                                        }`}>
                                        {seller?.status ? seller.status.charAt(0).toUpperCase() + seller.status.slice(1) : 'Status'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-900 text-indigo-400">
                                        {seller?.role || 'Role'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-violet-900 text-violet-300">
                                        <FaCreditCard className="inline mr-1" /> {seller?.payment || 'Payment Account'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700">
                        <div className="flex flex-wrap justify-around text-center">
                            <div className="p-2">
                                <p className="text-sm text-gray-400">Total Sales</p>
                                <p className="text-lg font-bold text-indigo-400">₦{formatNumber(availableAmount)}</p>
                            </div>
                            <div className="p-2">
                                <p className="text-sm text-gray-400">Products</p>
                                <p className="text-lg font-bold text-indigo-400">{formatNumber(totalProduct)}</p>
                            </div>
                            <div className="p-2">
                                <p className="text-sm text-gray-400">Pending Orders</p>
                                <p className="text-lg font-bold text-indigo-400">{formatNumber(totalPendingOrder)}</p>
                            </div>
                            <div className="p-2">
                                <p className="text-sm text-gray-400">Member Since</p>
                                <p className="text-lg font-bold text-indigo-400">
                                    {seller?.createdAt ? moment(seller.createdAt).format('MMM YYYY') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-4 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Basic Info Card */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                        <FaUser className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Basic Information</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FaUser className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Full Name</p>
                                            <p className="font-medium text-white">{seller?.name || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaEnvelope className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Email Address</p>
                                            <p className="font-medium text-white">{seller?.email || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaGlobe className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Account Role</p>
                                            <p className="font-medium text-white">{seller?.role || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaStore className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Business Type</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.businessType || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Info Card */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                        <FaStore className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Shop Information</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FaStore className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Shop Name</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.shopName || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaMapMarkerAlt className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Business Address</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.sub_district || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaMapMarkerAlt className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Postal Code</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.postalCode || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                        <FaMapMarkerAlt className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Location</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FaGlobe className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Country</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.division || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaMapMarkerAlt className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">State/Province</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.district || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                        <FaIdCard className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Document Verification</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FaIdCard className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Document Type</p>
                                            <p className="font-medium text-white">{seller?.shopInfo?.documentType || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FaShieldAlt className="mt-1 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-400">Verification Status</p>
                                            <p className="font-medium">
                                                <VerificationStatus status={seller?.shopInfo?.documentVerification?.status} />
                                            </p>
                                        </div>
                                    </div>

                                    {seller?.shopInfo?.document && (
                                        <a
                                            href={seller.shopInfo.document}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <button className="w-full py-3 mt-6 bg-gray-700 text-white font-medium rounded-lg border border-gray-600 hover:bg-gray-600/50 transition flex items-center justify-center gap-2">
                                                <FaIdCard /> View Verification Documents
                                            </button>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                        <FaShieldAlt className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Update Seller Status</h3>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Account Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                            required
                                        >
                                            <option value="">-- Select status --</option>
                                            <option value="active">Active</option>
                                            <option value="deactive">Deactive</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <FaShieldAlt /> Update Status
                                    </button>
                                </form>

                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <h4 className="font-bold text-white mb-2">Quick Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition">
                                            Message Seller
                                        </button>
                                        {/* <button className="px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition">
                                            View Products
                                        </button> */}
                                        {/* <button className="px-3 py-2 bg-gradient-to-r from-rose-700 to-rose-800 text-white text-sm rounded-lg hover:opacity-90 transition">
                                            Suspend Account
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 rounded-lg">
                                    <FaChartLine className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center">
                                            <FaUser className="text-white text-xs" />
                                        </div>
                                        <div className="w-0.5 h-full bg-gray-600 mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-gray-400 text-sm">Today, 10:42 AM</p>
                                        <p className="text-white">Account information updated</p>
                                        <p className="text-gray-500 text-sm">Changed business address details</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center">
                                            <FaShieldAlt className="text-white text-xs" />
                                        </div>
                                        <div className="w-0.5 h-full bg-gray-600 mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-gray-400 text-sm">Yesterday, 3:15 PM</p>
                                        <p className="text-white">Document verification approved</p>
                                        <p className="text-gray-500 text-sm">ID document was verified successfully</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center">
                                            <FaCreditCard className="text-white text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">June 18, 2024</p>
                                        <p className="text-white">Payment method updated</p>
                                        <p className="text-gray-500 text-sm">Changed primary payment account</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-sm text-gray-500 p-4">
                    <p>
                        Seller account last updated: {
                            seller?.updatedAt
                                ? moment(seller.updatedAt).format('MMMM Do YYYY, h:mm a')
                                : 'N/A'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SellerDetails;