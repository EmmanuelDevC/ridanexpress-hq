import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AutoReplyConfig = ({ sellerId, onClose }) => {
  const [config, setConfig] = useState({
    offlineMessage: "Thanks for your message! We're currently offline and will respond as soon as possible.",
    welcomeMessage: "Hello! Thanks for reaching out. How can I help you today?",
    orderInquiryResponse: "Your order is being processed and will ship soon. Track your order here: [link]",
    isActive: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${api_url}/api/auto-reply/${sellerId}`);
        
        if (response.data) {
          setConfig({
            offlineMessage: response.data.offlineMessage || config.offlineMessage,
            welcomeMessage: response.data.welcomeMessage || config.welcomeMessage,
            orderInquiryResponse: response.data.orderInquiryResponse || config.orderInquiryResponse,
            isActive: response.data.isActive !== undefined ? response.data.isActive : config.isActive
          });
        }
      } catch (error) {
        console.error('Error fetching auto-reply config:', error);
        if (error.response?.status === 404) {
          // No config exists yet, which is fine - we'll use defaults
          console.log('No auto-reply config found, using defaults');
        } else {
          toast.error('Failed to load auto-reply settings');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (sellerId) {
      fetchConfig();
    } else {
      setLoading(false);
      toast.error('Seller ID is missing');
    }
  }, [sellerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sellerId) {
      toast.error('Seller ID is missing');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await axios.post(`${api_url}/api/auto-reply`, {
        sellerId,
        ...config
      });
      
      if (response.data && response.data.message) {
        toast.success('Auto-reply settings saved successfully!');
        onClose();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving auto-reply config:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Auto-Reply Settings</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <FaQuestionCircle className="text-blue-500 mt-1 mr-2" />
            <p className="text-sm text-blue-700">
              These messages will be automatically sent to customers based on different scenarios.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={config.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                Enable Auto-Reply
              </label>
            </div>
            
            <div className="mb-4">
              <label htmlFor="offlineMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Offline Message
                <span className="text-xs text-gray-500 ml-1">(Sent when you're offline)</span>
              </label>
              <textarea
                id="offlineMessage"
                name="offlineMessage"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={config.offlineMessage}
                onChange={handleChange}
                placeholder="Message to send when offline"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
                <span className="text-xs text-gray-500 ml-1">(Sent when a new conversation starts)</span>
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={config.welcomeMessage}
                onChange={handleChange}
                placeholder="Initial message when customer starts chat"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="orderInquiryResponse" className="block text-sm font-medium text-gray-700 mb-1">
                Order Inquiry Response
                <span className="text-xs text-gray-500 ml-1">(Sent when customers ask about orders)</span>
              </label>
              <textarea
                id="orderInquiryResponse"
                name="orderInquiryResponse"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={config.orderInquiryResponse}
                onChange={handleChange}
                placeholder="Response for order status inquiries"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use [link] to insert tracking link automatically
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoReplyConfig;