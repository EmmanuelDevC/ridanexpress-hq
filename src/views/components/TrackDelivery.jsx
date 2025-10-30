import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // adjust the path to your api

const TrackDelivery = ({ orderId, endpoint }) => {
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const getTracking = async () => {
        setLoading(true);
        try {
            const url = endpoint === 'seller' 
                ? `/seller/track-delivery/${orderId}`
                : `/home/customer/track-delivery/${orderId}`;
            const response = await api.get(url);
            if (response.data.success) {
                setTrackingInfo(response.data);
            }
        } catch (error) {
            console.error('Tracking failed:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getTracking();
        // Poll every 30 seconds for real-time updates
        const interval = setInterval(getTracking, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    return (
        <div className="tracking-container">
            <h3>Delivery Tracking</h3>
            {loading ? (
                <div>Loading tracking information...</div>
            ) : trackingInfo ? (
                <div>
                    <p>Status: {trackingInfo.status}</p>
                    <p>Tracking ID: {trackingInfo.trackingId}</p>
                    {trackingInfo.trackingUrl && (
                        <a href={trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                            View Full Tracking
                        </a>
                    )}
                </div>
            ) : (
                <div>No tracking information available</div>
            )}
        </div>
    );
};

export default TrackDelivery;