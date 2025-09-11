import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { api_url } from "../../utils/utils";
import KwikAcceptModal from "../../views/components/KwikAcceptModal";
import toast from "react-hot-toast";
import { 
  messageClear, 
  get_seller_order, 
  seller_order_status_update 
} from '../../store/Reducers/OrderReducer';
import { 
  FiPackage, 
  FiCreditCard, 
  FiTruck, 
  FiMapPin,
  FiClock,
  FiAlertTriangle
} from 'react-icons/fi';

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { 
    order, 
    errorMessage, 
    successMessage 
  } = useSelector(state => state.order);
  const { userInfo } = useSelector((state) => state.auth);
  
  // State variables
  const [status, setStatus] = useState('');
  const [showKwikModal, setShowKwikModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [loadingTracking, setLoadingLoading] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);
  
  // Environment detection
  const isStaging = api_url.includes("staging") || api_url.includes("test");
  const kwikBaseUrl = "https://staging-api-test.kwik.delivery";
  
  // Status colors mapping
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    warehouse: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    accepted: 'bg-green-100 text-green-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-teal-100 text-teal-800'
  };

  // Fetch order data
  useEffect(() => {
    dispatch(get_seller_order(orderId));
  }, [dispatch, orderId]);

  // Set initial status
  useEffect(() => {
    if (order?.delivery_status) {
      setStatus(order.delivery_status);
    }
  }, [order]);

  // Fetch seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const response = await axios.get(
          `${api_url}/api/seller/profile`,
          { withCredentials: true }
        );
        setSellerProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch seller profile", error);
      }
    };
    
    if (userInfo) {
      fetchSellerProfile();
    }
  }, [userInfo]);

  // Handle status updates
  const status_update = (e) => {
    dispatch(seller_order_status_update({
      orderId,
      info: { status: e.target.value }
    }));
    setStatus(e.target.value);
  };

  // Handle toast notifications
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  // Kwick delivery functions
  const initiateKwikDelivery = async (details) => {
    try {
      await axios.put(
        `${api_url}/api/seller/accept-with-kwik/${orderId}`,
        details,
        { withCredentials: true }
      );
      
      dispatch(get_seller_order(orderId));
      toast.success("Kwik rider dispatched successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to dispatch Kwik rider");
    }
  };

  const fetchTrackingInfo = async () => {
    if (!order?.delivery?.kwikOrderId) return;
    
    setLoadingTracking(true);
    try {
      const response = await axios.get(
        `${api_url}/api/seller/track-delivery/${orderId}`,
        { withCredentials: true }
      );
      setTrackingInfo(response.data);
    } catch (error) {
      toast.error("Failed to load tracking info");
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    if (showTracking && order?.delivery?.provider === 'kwik') {
      fetchTrackingInfo();
    }
  }, [showTracking, order]);

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className='p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Staging Environment Banner */}
        {isStaging && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center">
              <FiAlertTriangle className="text-yellow-500 mr-2" />
              <div>
                <p className="font-bold text-yellow-800">Staging Environment</p>
                <p className="text-yellow-700">
                  Using Kwik staging API: {kwikBaseUrl}
                </p>
              </div>
            </div>
          </div>
        )}

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
          
          <div className="flex items-center gap-3">
            <select
              onChange={status_update}
              value={status}
              className={`px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${statusColors[status]
                } border-transparent font-medium text-sm cursor-pointer`}
            >
              <option value="pending" className="bg-white dark:bg-gray-800">Pending</option>
              <option value="processing" className="bg-white dark:bg-gray-800">Processing</option>
              <option value="warehouse" className="bg-white dark:bg-gray-800">Warehouse</option>
              <option value="accepted" className="bg-white dark:bg-gray-800">Accepted</option>
              <option value="in_transit" className="bg-white dark:bg-gray-800">In Transit</option>
              <option value="delivered" className="bg-white dark:bg-gray-800">Delivered</option>
              <option value="cancelled" className="bg-white dark:bg-gray-800">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        {order.delivery_status === 'pending' && !order.delivery?.provider && (
          <div className="mt-4">
            <button
              onClick={() => setShowKwikModal(true)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <FiTruck /> Accept and Arrange Kwik Delivery
            </button>
          </div>
        )}

        {/* Kwik Delivery Section */}
        {order.delivery?.provider === 'kwik' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Kwik Delivery
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status:</p>
                <p className="font-medium capitalize">
                  {order.delivery.status.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee:</p>
                <p className="font-medium">₦{order.delivery.fee?.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tracking ID:</p>
                <p className="font-medium">{order.delivery.kwikOrderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Environment:</p>
                <p className="font-medium">{isStaging ? 'Staging' : 'Production'}</p>
              </div>
            </div>
            
            {order.delivery.trackingUrl && (
              <div className="mt-4">
                <a 
                  href={order.delivery.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Live Tracking
                </a>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setShowTracking(!showTracking)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showTracking ? 'Hide Real-time Updates' : 'Show Real-time Updates'}
              </button>
              
              {showTracking && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {loadingTracking ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : trackingInfo ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <FiMapPin className="mt-1 text-blue-500" />
                        <div>
                          <p className="font-medium">Current Location</p>
                          <p>{trackingInfo.last_location || 'In transit'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <FiClock className="mt-1 text-blue-500" />
                        <div>
                          <p className="font-medium">Estimated Arrival</p>
                          <p>{trackingInfo.eta || 'Calculating...'}</p>
                        </div>
                      </div>
                      
                      {trackingInfo.rider && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                            <span className="text-xs">Rider</span>
                          </div>
                          <div>
                            <p className="font-medium">Rider Details</p>
                            <p>{trackingInfo.rider.name}</p>
                            <p>{trackingInfo.rider.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No tracking information available yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
                    e.target.src = '/placeholder-product.jpg';
                    e.target.alt = 'Product image unavailable';
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

      {/* Kwik Acceptance Modal */}
      {showKwikModal && (
        <KwikAcceptModal
          order={order}
          sellerAddress={sellerProfile?.address || ''}
          onClose={() => setShowKwikModal(false)}
          onAccept={initiateKwikDelivery}
        />
      )}
    </div>
  );
};

export default OrderDetails;