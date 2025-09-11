import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { get_products } from '../../store/Reducers/productReducer';

const ProductSelector = ({ onSelect, onClose }) => {
  const dispatch = useDispatch();
  const { products, totalProduct } = useSelector(state => state.product);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const obj = {
      parPage: 100, // Fetch more products for selection
      page: 1,
      searchValue
    };
    dispatch(get_products(obj));
  }, [searchValue, dispatch]);

  useEffect(() => {
    if (products) {
      setIsLoading(false);
      setFilteredProducts(products);
    }
  }, [products]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
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
          <div className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded-md text-xs">
            <FaTimesCircle className="text-xs" /> Rejected
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Select Product</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Select Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
        </div>
        
        <div className="overflow-y-auto flex-1">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-gray-700/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-gray-600">
                        <img
                          className="h-full w-full object-cover"
                          src={product.images[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{product.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{product.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{product.stock}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.status || 'pending')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelect(product)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm transition-colors"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="text-gray-500">
                      <div className="flex justify-center mb-4">
                        <div className="bg-gray-700 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-400">No products found</p>
                      <p className="text-sm mt-2 text-gray-500">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;