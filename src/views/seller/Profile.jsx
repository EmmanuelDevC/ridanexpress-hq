import React, { useEffect, useState, useRef } from 'react';
import {
    BsImages, BsPatchCheckFill, BsCloudUpload, BsShieldCheck,
    BsGlobe, BsBuilding, BsHouse, BsFileText, BsInfoCircle, BsCreditCard,
    BsExclamationTriangle, BsCheckCircle, BsClock, BsShieldLock,
    BsGeoAlt, BsMap, BsGeo, BsSearch, BsPinMap, BsChevronDown,
    BsPerson, BsTelephone, BsUpload, BsKey
} from 'react-icons/bs';
import { PropagateLoader } from 'react-spinners';
import { FadeLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { api_url } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { overrideStyle } from '../../utils/utils';
import {
    profile_image_upload,
    messageClear,
    profile_info_add
} from '../../store/Reducers/authReducer';
import { create_flutterwave_subaccount } from '../../store/Reducers/sellerReducer';

// Production-safe logging utilities
const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};
const debugError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

// Safe URL validation utility
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Safe API URL construction
const constructApiUrl = (endpoint) => {
  const baseUrl = process.env.REACT_APP_API_URL || api_url;
  const url = `${baseUrl}${endpoint}`;
  
  if (!isValidUrl(url)) {
    debugError('Invalid URL constructed:', url);
    throw new Error('Invalid API endpoint configuration');
  }
  
  return url;
};

// Mapbox configuration
const MAPBOX_CONFIG = {
  token: process.env.REACT_APP_MAPBOX_TOKEN || "pk.eyJ1IjoiZW1tYW51ZWxkZXYiLCJhIjoiY21oM2U3bG10MHF0dTJqczc1aXY3YXdkeCJ9.t3RnpzcgeMENOAO4lNcjrQ",
  baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  country: 'NG',
  limit: 5,
  types: 'address,place,poi'
};

const Profile = () => {
    const [state, setState] = useState({
        division: '',
        district: '',
        shopName: '',
        sub_district: '',
        businessType: 'small',
        cacNumber: '',
        tin: '',
        businessNumber: '',
        documentType: '',
        id_number: '',
        documentFile: null,
        documentPreview: null
    });

    const [locationStatus, setLocationStatus] = useState({
        loading: false,
        success: false,
        error: null,
        source: null,
        coordinates: null
    });

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // State for automatic address suggestions
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const dispatch = useDispatch();
    const { userInfo, loader, successMessage, errorMessage, token } = useSelector(state => state.auth);
    const sellerReducer = useSelector(state => state.seller);
    const [activeTab, setActiveTab] = useState('small');
    const [scrollToBusinessInfo, setScrollToBusinessInfo] = useState(false);
    const [tabMessage, setTabMessage] = useState('');
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        account_number: '',
        bank_code: ''
    });
    const businessInfoRef = useRef(null);
    const suggestionsRef = useRef(null);
    const addressInputRef = useRef(null);

    // Check if Mapbox is configured properly
    const isMapboxConfigured = () => {
        if (!MAPBOX_CONFIG.token) {
            debugError('Mapbox token is missing');
            return false;
        }
        
        // Check if token format is valid (starts with pk. or sk.)
        if (!MAPBOX_CONFIG.token.startsWith('pk.') && !MAPBOX_CONFIG.token.startsWith('sk.')) {
            debugError('Invalid Mapbox token format');
            return false;
        }
        
        return true;
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (userInfo?.shopInfo) {
            setState({
                division: userInfo.shopInfo.division || '',
                district: userInfo.shopInfo.district || '',
                shopName: userInfo.shopInfo.shopName || '',
                sub_district: userInfo.shopInfo.sub_district || '',
                businessType: userInfo.shopInfo.businessType || 'small',
                cacNumber: userInfo.shopInfo.cacNumber || '',
                tin: userInfo.shopInfo.tin || '',
                businessNumber: userInfo.shopInfo.businessNumber || '',
                documentType: userInfo.shopInfo.documentType || '',
                id_number: userInfo.shopInfo.id_number || '',
                documentFile: null,
                documentPreview: userInfo.shopInfo.document || null,
                documentVerification: userInfo.shopInfo.documentVerification || {
                    status: 'pending'
                }
            });
            setActiveTab(userInfo.shopInfo.businessType || 'small');
        }

        // Set location status based on existing data
        if (userInfo?.location?.coordinates) {
            setLocationStatus({
                loading: false,
                success: true,
                error: null,
                source: userInfo.location.geocodingSource || 'manual',
                coordinates: userInfo.location.coordinates
            });
        }
    }, [userInfo]);

    // Mapbox Forward Geocoding (Address to Coordinates)
    const searchAddressWithMapbox = async (query) => {
        try {
            // Check if Mapbox is configured
            if (!isMapboxConfigured()) {
                throw new Error('Mapbox service is not configured properly. Please check your API token.');
            }

            debugLog('Searching for address:', query);

            const params = new URLSearchParams({
                access_token: MAPBOX_CONFIG.token,
                limit: MAPBOX_CONFIG.limit,
                country: MAPBOX_CONFIG.country,
                types: MAPBOX_CONFIG.types
            });

            const response = await fetch(
                `${MAPBOX_CONFIG.baseUrl}/${encodeURIComponent(query)}.json?${params}`
            );

            if (response.status === 401) {
                throw new Error('Invalid Mapbox API token. Please check your token configuration.');
            }

            if (!response.ok) {
                throw new Error(`Mapbox API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            debugLog('Mapbox search results count:', data.features?.length || 0);
            return data.features || [];
        } catch (error) {
            debugError('Mapbox search error:', error);
            throw new Error(`Address search failed: ${error.message}`);
        }
    };

    // Mapbox Reverse Geocoding (Coordinates to Address)
    const reverseGeocodeWithMapbox = async (latitude, longitude) => {
        try {
            // Check if Mapbox is configured
            if (!isMapboxConfigured()) {
                throw new Error('Mapbox service is not configured properly. Please check your API token.');
            }

            debugLog('Reverse geocoding coordinates:', latitude, longitude);

            const params = new URLSearchParams({
                access_token: MAPBOX_CONFIG.token,
                limit: 1,
                types: 'address,place'
            });

            const response = await fetch(
                `${MAPBOX_CONFIG.baseUrl}/${longitude},${latitude}.json?${params}`
            );

            if (response.status === 401) {
                throw new Error('Invalid Mapbox API token. Please check your token configuration.');
            }

            if (!response.ok) {
                throw new Error(`Reverse geocoding failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (data.features && data.features.length > 0) {
                return {
                    address: data.features[0].place_name,
                    coordinates: { latitude, longitude }
                };
            }

            // Fallback if no address found
            return {
                address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                coordinates: { latitude, longitude }
            };
        } catch (error) {
            debugError('Reverse geocoding error:', error);
            // Fallback for any errors
            return {
                address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                coordinates: { latitude, longitude }
            };
        }
    };

    // Browser Geolocation to get current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            };

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        // Reverse geocode to get address from coordinates
                        const result = await reverseGeocodeWithMapbox(latitude, longitude);
                        resolve({
                            ...result,
                            source: 'browser_geolocation'
                        });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred while getting location.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                options
            );
        });
    };

    // Handle address search
    const handleAddressSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            debugLog('Searching for:', query);
            const results = await searchAddressWithMapbox(query);
            debugLog('Search results count:', results.length);
            setSearchResults(results);
        } catch (error) {
            debugError('Search error:', error);
            toast.error('Failed to search addresses: ' + error.message);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Select address from search results
    const handleSelectAddress = (feature) => {
        const [longitude, latitude] = feature.center;
        const address = feature.place_name;

        // Update the address field
        setState(prev => ({
            ...prev,
            sub_district: address
        }));

        // Set location status
        setLocationStatus({
            loading: false,
            success: true,
            error: null,
            source: 'mapbox_search',
            coordinates: { latitude, longitude }
        });

        setSearchQuery('');
        setSearchResults([]);
        setShowLocationModal(false);

        toast.success('Address selected and coordinates obtained!');
    };

    // Use current location
    const handleUseCurrentLocation = async () => {
        setLocationStatus({ loading: true, success: false, error: null, source: null });

        try {
            const locationData = await getCurrentLocation();

            // Update the address field with the found address
            setState(prev => ({
                ...prev,
                sub_district: locationData.address
            }));

            setLocationStatus({
                loading: false,
                success: true,
                error: null,
                source: locationData.source,
                coordinates: locationData.coordinates
            });

            setShowLocationModal(false);
            toast.success('Current location obtained!');
        } catch (error) {
            debugError('Current location error:', error);
            setLocationStatus({
                loading: false,
                success: false,
                error: error.message,
                source: null,
                coordinates: null
            });
            toast.error(error.message);
        }
    };

    // Automatic address suggestions as user types
    const getAddressSuggestions = async (query) => {
        if (!query.trim() || query.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsVerifying(true);
        setLocationStatus(prev => ({ ...prev, loading: true }));

        try {
            debugLog('Getting automatic address suggestions for:', query);
            const results = await searchAddressWithMapbox(query);

            if (results.length > 0) {
                setAddressSuggestions(results);
                setShowSuggestions(true);
            } else {
                setAddressSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            debugError('Automatic address suggestions error:', error);
            setAddressSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsVerifying(false);
            setLocationStatus(prev => ({ ...prev, loading: false }));
        }
    };

    // Select address from automatic suggestions
    const handleSelectSuggestion = (feature) => {
        const [longitude, latitude] = feature.center;
        const address = feature.place_name;

        // Update the address field
        setState(prev => ({
            ...prev,
            sub_district: address
        }));

        // Set location status
        setLocationStatus({
            loading: false,
            success: true,
            error: null,
            source: 'mapbox_autocomplete',
            coordinates: { latitude, longitude }
        });

        setShowSuggestions(false);
        setAddressSuggestions([]);

        toast.success('Address selected and coordinates obtained!');
    };

    // Handle address input change with debouncing
    const handleAddressInputChange = (e) => {
        const value = e.target.value;
        setState(prev => ({
            ...prev,
            sub_district: value
        }));

        // Clear location status when user starts typing
        if (value.length > 0) {
            setLocationStatus({
                loading: false,
                success: false,
                error: null,
                source: null,
                coordinates: null
            });
        }

        // Debounce the address suggestions
        clearTimeout(addressInputRef.current);
        addressInputRef.current = setTimeout(() => {
            getAddressSuggestions(value);
        }, 500);
    };

    // Open location modal
    const openLocationModal = () => {
        setShowLocationModal(true);
        setSearchQuery('');
        setSearchResults([]);
    };

    useEffect(() => {
        if (scrollToBusinessInfo && businessInfoRef.current) {
            businessInfoRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            setScrollToBusinessInfo(false);
        }
    }, [scrollToBusinessInfo]);

    useEffect(() => {
        let message = '';
        switch (activeTab) {
            case 'small':
                message = 'Personal Business tab selected';
                break;
            case 'registered':
                message = 'Licensed Enterprise tab selected';
                break;
            default:
                break;
        }

        if (message) {
            setTabMessage(message);
            const timer = setTimeout(() => setTabMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    const add_image = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('image', e.target.files[0]);
            dispatch(profile_image_upload(formData));
        }
    };

    const handleDocumentUpload = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];

            // Client-side validation
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error('Only JPG, PNG, or PDF files allowed');
                return;
            }

            if (file.size > maxSize) {
                toast.error('File size exceeds 5MB limit');
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            setState({
                ...state,
                documentFile: file,
                documentPreview: previewUrl
            });
        }
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }

        if (sellerReducer.successMessage) {
            toast.success(sellerReducer.successMessage);
            dispatch(messageClear());
        }
        if (sellerReducer.errorMessage) {
            toast.error(sellerReducer.errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, sellerReducer, dispatch]);

    const submit = async (e) => {
        e.preventDefault();

        // Check if we have location data
        if (!locationStatus.success || !locationStatus.coordinates) {
            toast.error('Please verify your location before saving');
            return;
        }

        try {
            const formData = new FormData();

            formData.append('shopName', state.shopName);
            formData.append('division', state.division);
            formData.append('district', state.district);
            formData.append('sub_district', state.sub_district);
            formData.append('businessType', state.businessType);
            formData.append('cacNumber', state.cacNumber || '');
            formData.append('tin', state.tin || '');
            formData.append('businessNumber', state.businessNumber);
            formData.append('documentType', state.documentType);
            formData.append('id_number', state.id_number);

            // Add location data
            formData.append('latitude', locationStatus.coordinates.latitude);
            formData.append('longitude', locationStatus.coordinates.longitude);
            formData.append('geocodingSource', locationStatus.source);
            formData.append('formattedAddress', state.sub_district);

            if (state.documentFile) {
                formData.append('document', state.documentFile);
            }

            dispatch(profile_info_add(formData));
        } catch (error) {
            debugError('Form submission error:', error);
            toast.error('Failed to save profile information');
        }
    };

    const inputHandle = (e) => {
        const { name, value } = e.target;
        
        if (name === 'sub_district') {
            handleAddressInputChange(e);
        } else {
            setState({
                ...state,
                [name]: value
            });
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setState(prev => ({
            ...prev,
            businessType: tab
        }));
    };

    const handleUpgrade = () => {
        setActiveTab('registered');
        setScrollToBusinessInfo(true);
    };

    const getBusinessBadge = () => {
        if (!userInfo?.shopInfo?.businessType) return null;

        if (userInfo.shopInfo.businessType === 'registered') {
            return {
                color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
                text: 'Verified Enterprise',
                icon: <BsPatchCheckFill className="mr-1" />
            };
        }
        return null;
    };

    // Persona Verification
    const startPersonaVerification = async () => {
        try {
            if (!token) {
                toast.error('Authentication token missing');
                return;
            }

            const apiUrl = constructApiUrl('/api/create-inquiry');
            
            const response = await axios.post(
                apiUrl,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.hostedUrl) {
                window.location.href = response.data.hostedUrl;
            } else {
                debugError('No hosted URL in response:', response);
                toast.error('Verification URL not received');
            }
        } catch (error) {
            debugError('Verification error:', {
                message: error.message,
                response: error.response?.data,
                stack: error.stack
            });

            toast.error('Verification failed: ' +
                (error.response?.data?.error || error.message));
        }
    };

    const businessBadge = getBusinessBadge();

    const activateFlutterwaveAccount = () => {
        if (!userInfo?.shopInfo?.shopName) {
            toast.error('Please set up your shop name first');
            return;
        }
        setShowBankForm(true);
    };

    const submitBankDetails = (e) => {
        e.preventDefault();
        dispatch(create_flutterwave_subaccount({
            account_number: bankDetails.account_number,
            bank_code: bankDetails.bank_code
        }));
        setShowBankForm(false);
    };

    return (
        <ErrorBoundary>
            <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30'>
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'>
                                    Business Profile
                                </h1>
                                <p className="text-slate-600 mt-2">Manage your business information and settings</p>
                            </div>
                            {businessBadge && (
                                <div className={`${businessBadge.color} text-white px-4 py-2 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2`}>
                                    {businessBadge.icon}
                                    <span className="text-sm font-semibold">{businessBadge.text}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {/* System Alerts */}
                    {process.env.NODE_ENV === 'production' && (
                        <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200/60 shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <BsShieldLock className="text-emerald-500 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-emerald-800 font-medium">Secure Identity Verification</p>
                                    <p className="text-emerald-600 text-sm mt-1">
                                        Powered by Persona • Enterprise-grade security
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isMapboxConfigured() && (
                        <div className="mb-6 p-4 bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 shadow-sm">
                            <div className="flex items-start space-x-3">
                                <BsExclamationTriangle className="text-amber-500 text-xl mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-amber-800 font-medium">Location Services Limited</p>
                                    <p className="text-amber-600 text-sm mt-1">
                                        Mapbox API is not properly configured. Some location features may not work.
                                        {isDevelopment && (
                                            <span className="font-medium"> Check your REACT_APP_MAPBOX_TOKEN environment variable.</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col xl:flex-row gap-8'>
                        {/* Main Content - Profile Section */}
                        <div className='flex-1'>
                            <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden'>
                                {/* Business Type Tabs */}
                                <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30 px-6">
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleTabChange('small')}
                                            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 rounded-t-xl ${
                                                activeTab === 'small' 
                                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 border-b-white' 
                                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <BsPerson className="text-lg" />
                                                <span>Personal Business</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('registered')}
                                            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 rounded-t-xl ${
                                                activeTab === 'registered' 
                                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 border-b-white' 
                                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <BsBuilding className="text-lg" />
                                                <span>Licensed Enterprise</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Upgrade Banner */}
                                    {userInfo?.shopInfo?.businessType === 'small' && (
                                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className="p-2 bg-blue-100 rounded-xl">
                                                            <BsPatchCheckFill className="text-blue-600 text-xl" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-blue-900 font-semibold text-lg">Upgrade to Enterprise</h3>
                                                            <p className="text-blue-700 text-sm mt-1">
                                                                Unlock premium features, build customer trust, and access exclusive seller tools.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleUpgrade}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                                                >
                                                    Upgrade Now
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab Navigation Message */}
                                    {tabMessage && (
                                        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200/60">
                                            <div className="flex items-center space-x-3">
                                                <BsInfoCircle className="text-blue-500 text-lg flex-shrink-0" />
                                                <p className="text-blue-700 text-sm font-medium">{tabMessage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Profile Header */}
                                    <div className='flex flex-col lg:flex-row gap-8 mb-8'>
                                        {/* Profile Image */}
                                        <div className='flex-shrink-0'>
                                            <div className='relative'>
                                                {userInfo?.image ? (
                                                    <label htmlFor="img" className='block h-40 w-40 relative rounded-2xl overflow-hidden cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 group'>
                                                        <img className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' src={userInfo.image} alt="Profile" />
                                                        {loader && (
                                                            <div className='absolute inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center'>
                                                                <FadeLoader color="#3b82f6" size={8} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <BsCloudUpload className="text-white text-2xl" />
                                                        </div>
                                                    </label>
                                                ) : (
                                                    <label className='flex flex-col justify-center items-center h-40 w-40 cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md group' htmlFor="img">
                                                        <div className="p-4 bg-blue-50 rounded-xl mb-3 group-hover:bg-blue-100 transition-colors">
                                                            <BsImages className='text-blue-500 text-2xl' />
                                                        </div>
                                                        <span className='text-slate-600 text-sm font-medium'>Upload Image</span>
                                                        {loader && (
                                                            <div className='absolute inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center rounded-2xl'>
                                                                <FadeLoader color="#3b82f6" size={8} />
                                                            </div>
                                                        )}
                                                    </label>
                                                )}
                                                <input onChange={add_image} type="file" className='hidden' id='img' />
                                            </div>
                                        </div>

                                        {/* User Info Card */}
                                        <div className='flex-1'>
                                            <div className='bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 shadow-sm border border-slate-200/60'>
                                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                                                    <BsPerson className="text-blue-500" />
                                                    <span>Account Information</span>
                                                </h3>
                                                
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                                    <div className="space-y-1">
                                                        <p className='text-slate-500 text-sm font-medium'>Full Name</p>
                                                        <p className='text-slate-800 font-semibold'>{userInfo?.name || 'N/A'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className='text-slate-500 text-sm font-medium'>Email Address</p>
                                                        <p className='text-slate-800 font-semibold'>{userInfo?.email || 'N/A'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className='text-slate-500 text-sm font-medium'>Account Role</p>
                                                        <p className='text-slate-800 font-semibold capitalize'>{userInfo?.role || 'N/A'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className='text-slate-500 text-sm font-medium'>Account Status</p>
                                                        <p className='text-slate-800 font-semibold capitalize'>{userInfo?.status || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center justify-between pt-4 border-t border-slate-200/60'>
                                                    <div className="space-y-1">
                                                        <p className='text-slate-500 text-sm font-medium'>Payment Account</p>
                                                        <p className='flex items-center gap-2 text-sm font-semibold'>
                                                            {userInfo?.payment === 'active' ? (
                                                                <span className='text-emerald-600 flex items-center space-x-1'>
                                                                    <BsCheckCircle className="text-emerald-500" />
                                                                    <span>Active</span>
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={activateFlutterwaveAccount}
                                                                    className='text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                                                                >
                                                                    {sellerReducer.loader ? 'Activating...' : 'Activate Payments'}
                                                                </button>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Information Section */}
                                    <div ref={businessInfoRef} className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 shadow-sm border border-slate-200/60">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-xl">
                                                    <BsBuilding className="text-blue-600 text-xl" />
                                                </div>
                                                <span>Business Information</span>
                                            </h3>
                                        </div>

                                        <form onSubmit={submit} className='space-y-6'>
                                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                                {/* Shop Name */}
                                                <div className="space-y-2">
                                                    <label htmlFor="Shop" className='block text-slate-700 text-sm font-semibold'>Shop Name *</label>
                                                    <div className="relative">
                                                        <BsHouse className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                                                        <input
                                                            value={state.shopName}
                                                            onChange={inputHandle}
                                                            className='w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                            type="text"
                                                            placeholder='Enter your shop name'
                                                            name='shopName'
                                                            id='Shop'
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Country */}
                                                <div className="space-y-2">
                                                    <label htmlFor="div" className='block text-slate-700 text-sm font-semibold'>Country *</label>
                                                    <div className="relative">
                                                        <BsGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                                                        <input
                                                            value={state.division}
                                                            onChange={inputHandle}
                                                            className='w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                            type="text"
                                                            placeholder='Enter country'
                                                            name='division'
                                                            id='div'
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* State/Province */}
                                                <div className="space-y-2">
                                                    <label htmlFor="district" className='block text-slate-700 text-sm font-semibold'>State/Province *</label>
                                                    <input
                                                        value={state.district}
                                                        onChange={inputHandle}
                                                        className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                        type="text"
                                                        placeholder='Enter state/province'
                                                        name='district'
                                                        id='district'
                                                        required
                                                    />
                                                </div>

                                                {/* Business Contact Number */}
                                                <div className="space-y-2">
                                                    <label htmlFor="businessNumber" className='block text-slate-700 text-sm font-semibold'>Business Contact *</label>
                                                    <div className="relative">
                                                        <BsTelephone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                                                        <input
                                                            value={state.businessNumber}
                                                            onChange={inputHandle}
                                                            className='w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                            type="number"
                                                            placeholder='Enter business phone number'
                                                            name='businessNumber'
                                                            id='businessNumber'
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Address with Location Tools */}
                                                <div className="lg:col-span-2 space-y-2">
                                                    <label htmlFor="sub" className='block text-slate-700 text-sm font-semibold'>Business Address *</label>
                                                    <div className="space-y-3" ref={suggestionsRef}>
                                                        <div className="relative">
                                                            <input
                                                                value={state.sub_district}
                                                                onChange={inputHandle}
                                                                className='w-full pl-4 pr-16 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                                type="text"
                                                                placeholder='Enter your business address or use location tools'
                                                                name='sub_district'
                                                                id='sub'
                                                                required
                                                                autoComplete="off"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={openLocationModal}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                                                                title="Use location tools"
                                                            >
                                                                <BsPinMap className="text-sm" />
                                                            </button>
                                                        </div>

                                                        {/* Automatic Address Suggestions */}
                                                        {showSuggestions && addressSuggestions.length > 0 && (
                                                            <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-xl shadow-slate-500/10 max-h-60 overflow-y-auto">
                                                                <div className="p-4 bg-slate-50 border-b border-slate-200">
                                                                    <p className="text-slate-700 text-sm font-semibold flex items-center space-x-2">
                                                                        <BsSearch className="text-blue-500" />
                                                                        <span>Select Address ({addressSuggestions.length} found)</span>
                                                                    </p>
                                                                </div>
                                                                <div className="divide-y divide-slate-200">
                                                                    {addressSuggestions.map((feature, index) => (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            onClick={() => handleSelectSuggestion(feature)}
                                                                            className="w-full p-4 text-left hover:bg-blue-50/50 transition-colors duration-200"
                                                                        >
                                                                            <div className="flex items-start space-x-3">
                                                                                <BsGeoAlt className="text-blue-500 mt-1 flex-shrink-0" />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-slate-800 text-sm font-medium truncate">{feature.place_name}</p>
                                                                                    <p className="text-slate-500 text-xs mt-1">
                                                                                        {feature.properties?.address || feature.text}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Loading indicator */}
                                                        {isVerifying && (
                                                            <div className="flex items-center space-x-2 text-blue-600 text-sm">
                                                                <FadeLoader color="#3b82f6" size={6} />
                                                                <span>Finding address suggestions...</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Location Status Indicators */}
                                                    {locationStatus.loading && (
                                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                            <div className="flex items-center space-x-3">
                                                                <FadeLoader color="#3b82f6" size={6} />
                                                                <span className="text-blue-700 text-sm font-medium">Processing location...</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {locationStatus.success && (
                                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                                            <div className="flex items-center space-x-3">
                                                                <BsCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                                                                <span className="text-emerald-700 text-sm font-medium">Address verified successfully</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {locationStatus.error && (
                                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                            <div className="flex items-center space-x-3">
                                                                <BsExclamationTriangle className="text-amber-500 text-lg flex-shrink-0" />
                                                                <span className="text-amber-700 text-sm">{locationStatus.error}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Identity Verification */}
                                                <div className="lg:col-span-2 space-y-3">
                                                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/60">
                                                        <h3 className="text-slate-800 font-semibold text-sm mb-3 flex items-center space-x-2">
                                                            <BsShieldCheck className="text-blue-500" />
                                                            <span>Identity Verification</span>
                                                        </h3>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                            <div className="flex-1">
                                                                <p className="text-slate-600 text-sm">
                                                                    Verify your identity to access all platform features and build trust with customers.
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={startPersonaVerification}
                                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center space-x-2"
                                                            >
                                                                <BsShieldCheck className="text-lg" />
                                                                <span>Verify Identity</span>
                                                            </button>
                                                        </div>

                                                        {userInfo?.shopInfo?.documentVerification?.status && (
                                                            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-slate-600 text-sm font-medium">Verification Status:</span>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                        userInfo.shopInfo.documentVerification.status === 'verified'
                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                            : userInfo.shopInfo.documentVerification.status === 'pending'
                                                                                ? 'bg-amber-100 text-amber-800'
                                                                                : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {userInfo.shopInfo.documentVerification.status.charAt(0).toUpperCase() +
                                                                            userInfo.shopInfo.documentVerification.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Registered Business Details */}
                                            {activeTab === 'registered' && (
                                                <div className='p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-200/60'>
                                                    <h3 className='text-slate-800 font-semibold text-lg mb-4 flex items-center space-x-2'>
                                                        <BsFileText className="text-blue-500" />
                                                        <span>Business Registration Details</span>
                                                    </h3>

                                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                                        <div className="space-y-2">
                                                            <label htmlFor="cacNumber" className='block text-slate-700 text-sm font-semibold'>CAC Registration Number *</label>
                                                            <input
                                                                value={state.cacNumber}
                                                                onChange={inputHandle}
                                                                className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                                type="text"
                                                                placeholder='Enter CAC number'
                                                                name='cacNumber'
                                                                id='cacNumber'
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label htmlFor="tin" className='block text-slate-700 text-sm font-semibold'>Tax ID (TIN) *</label>
                                                            <input
                                                                value={state.tin}
                                                                onChange={inputHandle}
                                                                className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                                type="text"
                                                                placeholder='Enter tax ID number'
                                                                name='tin'
                                                                id='tin'
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <button
                                                disabled={loader || !locationStatus.success}
                                                className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 text-sm ${
                                                    (loader || !locationStatus.success)
                                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {loader ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <PropagateLoader color='#ffffff' cssOverride={overrideStyle} size={8} />
                                                        <span>Saving Changes...</span>
                                                    </div>
                                                ) : !locationStatus.success ? (
                                                    'Please Verify Location First'
                                                ) : (
                                                    'Save Business Information'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Security & Payment */}
                        <div className='xl:w-96 space-y-6'>
                            {/* Security Settings Card */}
                            <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden'>
                                <div className="p-6">
                                    <h2 className='text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3'>
                                        <div className="p-2 bg-blue-100 rounded-xl">
                                            <BsKey className="text-blue-600 text-xl" />
                                        </div>
                                        <span>Security Settings</span>
                                    </h2>

                                    <div className='space-y-6'>
                                        <div>
                                            <h3 className='text-slate-700 font-semibold text-sm mb-4 pb-2 border-b border-slate-200/60'>Change Password</h3>
                                            <form className='space-y-4'>
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className='block text-slate-600 text-sm font-medium'>Email Address</label>
                                                    <input
                                                        className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                        type="email"
                                                        placeholder='your@email.com'
                                                        name='email'
                                                        id='email'
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="o_password" className='block text-slate-600 text-sm font-medium'>Current Password</label>
                                                    <input
                                                        className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                        type="password"
                                                        placeholder='••••••••'
                                                        name='old_password'
                                                        id='o_password'
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="n_password" className='block text-slate-600 text-sm font-medium'>New Password</label>
                                                    <input
                                                        className='w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm'
                                                        type="password"
                                                        placeholder='••••••••'
                                                        name='new_password'
                                                        id='n_password'
                                                    />
                                                </div>
                                                <button className='w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30'>
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Account Card */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                                        <div className="p-2 bg-emerald-100 rounded-xl">
                                            <BsCreditCard className="text-emerald-600 text-xl" />
                                        </div>
                                        <span>Payment Account</span>
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                                            <div className="space-y-1">
                                                <p className="text-slate-600 text-sm font-medium">Account Status</p>
                                                <p className="text-slate-800 font-semibold">
                                                    {userInfo?.payment === 'active' ? 'Active' : 'Not Activated'}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                userInfo?.payment === 'active'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {userInfo?.payment === 'active' ? 'Verified' : 'Pending'}
                                            </div>
                                        </div>

                                        {userInfo?.payment !== 'active' && (
                                            <button
                                                onClick={activateFlutterwaveAccount}
                                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                                            >
                                                Activate Payment Account
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Search Modal */}
                {showLocationModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-500/20 w-full max-w-2xl border border-slate-200/60 overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
                                <h3 className="text-xl font-semibold text-slate-800">Find Your Location</h3>
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Mapbox Configuration Warning */}
                                {!isMapboxConfigured() && (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <div className="flex items-start space-x-3">
                                            <BsExclamationTriangle className="text-amber-500 text-lg mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-amber-800 font-medium text-sm">Location Search Unavailable</p>
                                                <p className="text-amber-600 text-xs mt-1">
                                                    Mapbox API is not properly configured. Please use "Use My Current Location" or enter your address manually.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Search Input */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                if (isMapboxConfigured()) {
                                                    handleAddressSearch(e.target.value);
                                                }
                                            }}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                                            placeholder="Search for an address, place, or landmark..."
                                            disabled={!isMapboxConfigured()}
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <FadeLoader color="#3b82f6" size={8} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Current Location Button */}
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <button
                                            onClick={handleUseCurrentLocation}
                                            disabled={locationStatus.loading}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
                                        >
                                            <BsGeo className="text-lg" />
                                            <span>{locationStatus.loading ? 'Getting Your Location...' : 'Use My Current Location'}</span>
                                        </button>
                                        <p className="text-blue-600 text-xs text-center mt-2">
                                            This will use your device's GPS to find your exact location
                                        </p>
                                    </div>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-xl shadow-sm">
                                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                                            <p className="text-slate-700 text-sm font-semibold">Search Results</p>
                                        </div>
                                        <div className="divide-y divide-slate-200">
                                            {searchResults.map((feature, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectAddress(feature)}
                                                    className="w-full p-4 text-left hover:bg-blue-50/50 transition-colors duration-200"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <BsPinMap className="text-blue-500 mt-1 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-slate-800 text-sm font-medium truncate">{feature.place_name}</p>
                                                            <p className="text-slate-500 text-xs mt-1">
                                                                {feature.properties?.address || feature.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchQuery && searchResults.length === 0 && !isSearching && isMapboxConfigured() && (
                                    <div className="p-4 text-center border border-slate-300 rounded-xl bg-slate-50">
                                        <p className="text-slate-600 text-sm">No results found for "{searchQuery}"</p>
                                        <p className="text-slate-500 text-xs mt-1">Try a different address or landmark</p>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="text-slate-700 text-sm font-semibold mb-2 flex items-center space-x-2">
                                        <BsInfoCircle className="text-blue-500" />
                                        <span>How to find your location</span>
                                    </h4>
                                    <ul className="text-slate-600 text-xs space-y-1">
                                        <li>• Search for any address, business, or landmark</li>
                                        <li>• Use "Current Location" for your exact GPS coordinates</li>
                                        <li>• Selected locations will be saved with coordinates</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bank Details Modal */}
                {showBankForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-500/20 w-full max-w-md border border-slate-200/60 overflow-hidden">
                            <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
                                <h3 className="text-xl font-semibold text-slate-800">Add Bank Details</h3>
                            </div>

                            {/* Test Mode Indicator */}
                            {process.env.NODE_ENV !== 'production' && (
                                <div className="p-4 bg-amber-50 border-b border-amber-200">
                                    <div className="flex items-start space-x-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-amber-800 font-medium text-sm">Test Mode Activated</p>
                                            <p className="text-amber-600 text-xs mt-1">
                                                Use test account numbers: Access Bank - 0690000032, GTBank - 0233333334
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submitBankDetails} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-slate-700 text-sm font-semibold">Account Number</label>
                                    <input
                                        type="text"
                                        value={bankDetails.account_number}
                                        onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                                        placeholder="1234567890"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-700 text-sm font-semibold">Bank</label>
                                    <select
                                        value={bankDetails.bank_code}
                                        onChange={(e) => setBankDetails({ ...bankDetails, bank_code: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                                        required
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="044">Access Bank</option>
                                        <option value="058">Guaranty Trust Bank (GTB)</option>
                                        <option value="033">United Bank For Africa (UBA)</option>
                                        <option value="035">Wema Bank</option>
                                        <option value="057">Zenith Bank</option>
                                        <option value="050">Ecobank Nigeria</option>
                                        <option value="070">Fidelity Bank</option>
                                        <option value="011">First Bank of Nigeria</option>
                                        <option value="030">Heritage Bank</option>
                                        <option value="301">Jaiz Bank</option>
                                        <option value="082">Keystone Bank</option>
                                        <option value="076">Polaris Bank</option>
                                        <option value="101">Providus Bank</option>
                                        <option value="221">Stanbic IBTC Bank</option>
                                        <option value="068">Standard Chartered Bank</option>
                                        <option value="232">Sterling Bank</option>
                                        <option value="100">Suntrust Bank</option>
                                        <option value="032">Union Bank of Nigeria</option>
                                        <option value="215">Unity Bank</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowBankForm(false)}
                                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sellerReducer.loader}
                                        className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center space-x-2 ${
                                            sellerReducer.loader ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {sellerReducer.loader ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            'Activate Account'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Profile;