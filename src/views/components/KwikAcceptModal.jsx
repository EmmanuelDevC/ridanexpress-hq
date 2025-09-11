import React, { useState } from 'react';
import { FiPackage, FiX, FiCheck, FiMapPin, FiDollarSign, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { api_url } from '../../utils/utils';

const KwikAcceptModal = ({ 
  order, 
  sellerAddress, 
  onClose, 
  onAccept 
}) => {
  const [weight, setWeight] = useState(1);
  const [pickupAddress, setPickupAddress] = useState(sellerAddress || '');
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateFee = async () => {
    if (!pickupAddress) {
      setError('Please enter pickup address');
      return;
    }
    
    if (!order.shippingInfo?.address) {
      setError('Delivery address not found');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${api_url}/api/seller/calculate-kwik-fee`,
        {
          pickup: pickupAddress,
          delivery: order.shippingInfo.address,
          weight
        },
        { withCredentials: true }
      );
      
      setFee(response.data.fee);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to calculate fee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!fee) {
      setError('Please calculate fee first');
      return;
    }
    onAccept({
      weight,
      pickupAddress
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Arrange Kwik Delivery</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Package Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter weight in kg"
              />
              <FiPackage className="absolute right-3 top-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum weight: 0.1kg</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup Address</label>
            <div className="relative">
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                rows="3"
                className="w-full p-3 border rounded-lg"
                placeholder="Enter your pickup address"
              />
              <FiMapPin className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={calculateFee}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiDollarSign />}
              Calculate Delivery Fee
            </button>
            
            {fee !== null && !error && (
              <div className="ml-2 text-lg font-semibold">
                ₦{fee.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!fee}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 ${!fee ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiCheck size={18} />
            Confirm and Dispatch Rider
          </button>
        </div>
      </div>
    </div>
  );
};

export default KwikAcceptModal;