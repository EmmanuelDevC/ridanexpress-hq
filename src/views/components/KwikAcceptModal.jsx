import React, { useState, useEffect } from 'react';
import api from '../api/api';

const KwikAcceptModal = ({ order, onClose, onAccept }) => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [isInsured, setIsInsured] = useState(true);
    const [instructions, setInstructions] = useState('');
    const [loadersCount, setLoadersCount] = useState(0);
    const [calculatedFee, setCalculatedFee] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVehicleOptions();
        calculateFee();
    }, [selectedVehicle, isInsured, loadersCount]);

    const fetchVehicleOptions = async () => {
        try {
            const response = await api.get('/shipping/vehicles');
            setVehicles(response.data.vehicles);
            if (response.data.vehicles.length > 0) {
                setSelectedVehicle(response.data.vehicles[0].vehicle_id);
            }
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        }
    };

    const calculateFee = async () => {
        if (!selectedVehicle) return;
        
        try {
            const response = await api.post('/seller/calculate-kwik-fee', {
                orderId: order._id,
                vehicleId: selectedVehicle,
                isInsured,
                loadersCount
            });
            setCalculatedFee(response.data.fee);
        } catch (error) {
            console.error('Fee calculation failed:', error);
        }
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            await onAccept({
                vehicleId: selectedVehicle,
                isInsured,
                instructions,
                loadersCount
            });
            onClose();
        } catch (error) {
            console.error('Acceptance failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Accept with Kwik Delivery</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                        <select 
                            value={selectedVehicle} 
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            {vehicles.map(vehicle => (
                                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                                    {vehicle.name} (Max {vehicle.weight}kg)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            checked={isInsured}
                            onChange={(e) => setIsInsured(e.target.checked)}
                            className="mr-2"
                        />
                        <label>Include Insurance</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Loaders Required</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="4"
                            value={loadersCount}
                            onChange={(e) => setLoadersCount(parseInt(e.target.value))}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Instructions</label>
                        <textarea 
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full border rounded p-2"
                            rows="3"
                            placeholder="Special handling instructions..."
                        />
                    </div>

                    <div className="font-bold text-lg">
                        Delivery Fee: ₦{calculatedFee}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAccept}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Accept & Dispatch'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KwikAcceptModal;