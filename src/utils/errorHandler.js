export const handleApiError = (error, context = '') => {
    console.error(`API Error in ${context}:`, error);
    
    if (error.response) {
        // Server responded with error status
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        return {
            error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
            status: error.response.status,
            data: error.response.data
        };
    } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        return {
            error: 'No response from server. Please check your connection.',
            status: null
        };
    } else {
        // Something else happened
        console.error('Error message:', error.message);
        return {
            error: error.message || 'An unexpected error occurred',
            status: null
        };
    }
};

export const validateSellerData = (sellerData) => {
    const errors = [];
    
    if (!sellerData.name?.trim()) errors.push('Name is required');
    if (!sellerData.email?.trim()) errors.push('Email is required');
    if (!sellerData.password?.trim()) errors.push('Password is required');
    if (sellerData.password?.length < 6) errors.push('Password must be at least 6 characters');
    if (!sellerData.phone?.trim()) errors.push('Phone number is required');
    
    return errors;
};