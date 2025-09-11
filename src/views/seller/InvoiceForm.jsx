import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

const InvoiceForm = ({ onSubmit, onClose }) => {
  const [items, setItems] = useState([{ name: '', price: 0, quantity: 1 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate totals when items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const taxAmount = newSubtotal * (taxRate / 100);
    const newTotal = newSubtotal + taxAmount + shippingFee;
    
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [items, taxRate, shippingFee]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'price' || field === 'quantity') {
      newItems[index][field] = Number(value);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      items: items.filter(item => item.name.trim() !== ''),
      subtotal,
      tax: subtotal * (taxRate / 100),
      shipping: shippingFee,
      total
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Create Invoice</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items
          </label>
          
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Item name"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={item.price}
                  min="0"
                  step="0.01"
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 flex items-center">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="col-span-1 flex items-center">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="flex items-center text-sm text-indigo-600 mt-1"
          >
            <FaPlus className="mr-1" /> Add Item
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              value={taxRate}
              min="0"
              max="100"
              onChange={(e) => setTaxRate(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Fee ($)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              value={shippingFee}
              min="0"
              step="0.01"
              onChange={(e) => setShippingFee(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mb-4">
          <div className="flex justify-between mb-1">
            <span className="font-medium">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Tax ({taxRate}%):</span>
            <span>${(subtotal * (taxRate / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Shipping:</span>
            <span>${shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Send Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;