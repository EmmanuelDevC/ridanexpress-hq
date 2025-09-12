import React, { useEffect, useState, useRef } from 'react';
import {
    BsImages, BsPatchCheckFill, BsCloudUpload, BsShieldCheck,
    BsGlobe, BsBuilding, BsHouse, BsFileText, BsCreditCard,
    BsExclamationTriangle, BsCheckCircle, BsClock, BsShieldLock
} from 'react-icons/bs';
import { PropagateLoader } from 'react-spinners';
import { FadeLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { api_url } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { overrideStyle } from '../../utils/utils';
import {
    profile_image_upload,
    messageClear,
    profile_info_add
} from '../../store/Reducers/authReducer';
import { create_flutterwave_subaccount } from '../../store/Reducers/sellerReducer';

const Profile = () => {
    const [state, setState] = useState({
        division: '',
        district: '',
        shopName: '',
        sub_district: '',
        businessType: 'small',
        cacNumber: '',
        tin: '',
        postalCode: '',
        documentType: '',
        id_number: '',
        documentFile: null,
        documentPreview: null
    });

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
                postalCode: userInfo.shopInfo.postalCode || '',
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
    }, [userInfo]);

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

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('shopName', state.shopName);
        formData.append('division', state.division);
        formData.append('district', state.district);
        formData.append('sub_district', state.sub_district);
        formData.append('businessType', state.businessType);
        formData.append('cacNumber', state.cacNumber || '');
        formData.append('tin', state.tin || '');
        formData.append('postalCode', state.postalCode);
        formData.append('documentType', state.documentType);
        formData.append('id_number', state.id_number);

        if (state.documentFile) {
            formData.append('document', state.documentFile);
        }

        dispatch(profile_info_add(formData));
    };

    const inputHandle = (e) => {
        const { name, value } = e.target;
        setState({
            ...state,
            [name]: value
        });
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
                color: 'bg-gradient-to-r from-indigo-600 to-purple-600',
                text: 'Verified vendor',
                icon: <BsPatchCheckFill className="mr-1" />
            };
        }
        return null;
    };

    //Persona Verification
    const startPersonaVerification = async () => {
        try {
            if (!token) {
                toast.error('Authentication token missing');
                return;
            }

            const response = await axios.post(
                `${api_url}/api/create-inquiry`,
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
                console.error('No hosted URL in response:', response);
                toast.error('Verification URL not received');
            }
        } catch (error) {
            console.error('Verification error:', {
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
        <div className='px-2 sm:px-4 lg:px-6 py-4 bg-gradient-to-b from-slate-900 to-gray-900 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                {/* Production Security Badge */}
                {process.env.NODE_ENV === 'production' && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-emerald-900/30 to-green-900/20 border border-emerald-700 rounded-xl flex items-center">
                        <BsShieldLock className="text-emerald-400 text-lg mr-2" />
                        <div>
                            <p className="text-emerald-300 font-medium text-sm">Active • Persona</p>
                            <p className="text-emerald-400 text-xs mt-1">
                                Identity verification powered by Persona
                            </p>
                        </div>
                    </div>
                )}

                <div className='flex flex-col lg:flex-row gap-4 sm:gap-6'>
                    {/* Left Column - Profile Section */}
                    <div className='w-full lg:w-8/12'>
                        <div className='bg-gradient-to-b from-gray-800 to-gray-850 p-3 sm:p-4 md:p-6 border border-gray-700 rounded-xl'>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                                <h2 className='text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-0'>Business Profile</h2>
                                {businessBadge && (
                                    <span className={`${businessBadge.color} text-white px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center`}>
                                        {businessBadge.icon}
                                        {businessBadge.text}
                                    </span>
                                )}
                            </div>

                            {/* Business Type Tabs */}
                            <div className='mb-4 sm:mb-6 flex border-b border-gray-700 overflow-x-auto'>
                                <button
                                    onClick={() => handleTabChange('small')}
                                    className={`px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === 'small' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    Personal Business
                                </button>
                                <button
                                    onClick={() => handleTabChange('registered')}
                                    className={`px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === 'registered' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    Licensed Enterprise
                                </button>
                            </div>

                            {/* Tab Navigation Message */}
                            {tabMessage && (
                                <div className="mb-3 p-2 sm:p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-xl text-blue-300 text-xs sm:text-sm">
                                    {tabMessage}
                                </div>
                            )}

                            {/* Upgrade Prompt for Small Business */}
                            {userInfo?.shopInfo?.businessType === 'small' && (
                                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-orange-900/30 to-amber-900/20 border border-orange-700 rounded-xl p-3 sm:p-4">
                                    <h3 className="text-orange-400 font-medium flex items-center text-sm sm:text-base">
                                        <BsPatchCheckFill className="mr-2" />
                                        Upgrade Your Business Account
                                    </h3>
                                    <p className="text-orange-200 text-xs sm:text-sm mt-1 sm:mt-2">
                                        Register as a licensed enterprise to unlock premium features,
                                        gain customer trust, and access exclusive seller tools.
                                    </p>
                                    <button
                                        onClick={handleUpgrade}
                                        className="mt-2 sm:mt-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shadow-lg shadow-orange-500/20"
                                    >
                                        Upgrade Now
                                    </button>
                                </div>
                            )}

                            {/* Profile Image and Info */}
                            <div className='flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8'>
                                {/* Profile Image */}
                                <div className='w-full md:w-5/12'>
                                    <div className='flex justify-center'>
                                        {userInfo?.image ? (
                                            <label htmlFor="img" className='h-32 sm:h-40 w-32 sm:w-40 relative rounded-lg overflow-hidden cursor-pointer border-2 border-gray-700 hover:border-orange-500 transition-all shadow-lg'>
                                                <img className='w-full h-full object-cover' src={userInfo.image} alt="Profile" />
                                                {loader && (
                                                    <div className='absolute inset-0 bg-gray-900/80 flex justify-center items-center'>
                                                        <FadeLoader color="#f97316" size={8} />
                                                    </div>
                                                )}
                                            </label>
                                        ) : (
                                            <label className='flex flex-col justify-center items-center h-32 sm:h-40 w-32 sm:w-40 cursor-pointer border-2 border-dashed border-gray-700 rounded-xl hover:border-orange-500 transition-colors relative bg-gray-800/50' htmlFor="img">
                                                <BsImages className='text-gray-500 text-2xl sm:text-3xl mb-1 sm:mb-2' />
                                                <span className='text-gray-400 text-xs sm:text-sm'>Upload Image</span>
                                                {loader && (
                                                    <div className='absolute inset-0 bg-gray-900/80 flex justify-center items-center'>
                                                        <FadeLoader color="#f97316" size={8} />
                                                    </div>
                                                )}
                                            </label>
                                        )}
                                        <input onChange={add_image} type="file" className='hidden' id='img' />
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className='w-full md:w-7/12'>
                                    <div className='p-3 sm:p-4 md:p-5 bg-gradient-to-b from-gray-800/50 to-gray-800/30 rounded-xl border border-gray-700 shadow-inner'>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4'>
                                            <div>
                                                <p className='text-gray-400 text-xs sm:text-sm mb-1'>Full Name</p>
                                                <p className='text-white font-medium text-sm sm:text-base'>{userInfo.name}</p>
                                            </div>
                                            <div>
                                                <p className='text-gray-400 text-xs sm:text-sm mb-1'>Email Address</p>
                                                <p className='text-white font-medium text-sm sm:text-base'>{userInfo.email}</p>
                                            </div>
                                            <div>
                                                <p className='text-gray-400 text-xs sm:text-sm mb-1'>Account Role</p>
                                                <p className='text-white font-medium text-sm sm:text-base'>{userInfo.role}</p>
                                            </div>
                                            <div>
                                                <p className='text-gray-400 text-xs sm:text-sm mb-1'>Account Status</p>
                                                <p className='text-white font-medium text-sm sm:text-base'>{userInfo.status}</p>
                                            </div>
                                        </div>

                                        <div className='flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-700'>
                                            <div>
                                                <p className='text-gray-400 text-xs sm:text-sm mb-1'>Payment Account</p>
                                                <p className='flex items-center gap-2 text-xs sm:text-sm font-medium'>
                                                    {userInfo.payment === 'active' ? (
                                                        <span className='text-green-400 font-medium'>Active</span>
                                                    ) : (
                                                        <span
                                                            onClick={activateFlutterwaveAccount}
                                                            className='text-white text-xs sm:text-sm font-base bg-indigo-700 py-1.5 px-2.5 sm:py-2 sm:px-3 cursor-pointer rounded'
                                                        >
                                                            {sellerReducer.loader ? 'Activating...' : 'Activate Payment Account'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Info Section */}
                            <div ref={businessInfoRef} className="bg-gradient-to-b from-gray-800/30 to-gray-800/10 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                                    <BsBuilding className="mr-2 text-orange-500" />
                                    Business Information
                                </h3>

                                <form onSubmit={submit} className='space-y-4 sm:space-y-6'>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                                        <div className="relative">
                                            <label htmlFor="Shop" className='block text-gray-400 text-xs sm:text-sm mb-2'>Shop Name</label>
                                            <div className="relative">
                                                <BsHouse className="absolute left-3 top-3 text-gray-500 text-sm" />
                                                <input
                                                    value={state.shopName}
                                                    onChange={inputHandle}
                                                    className='w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                    type="text"
                                                    placeholder='Enter shop name'
                                                    name='shopName'
                                                    id='Shop'
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="div" className='block text-gray-400 text-xs sm:text-sm mb-2'>Country</label>
                                            <div className="relative">
                                                <BsGlobe className="absolute left-3 top-3 text-gray-500 text-sm" />
                                                <input
                                                    value={state.division}
                                                    onChange={inputHandle}
                                                    className='w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                    type="text"
                                                    placeholder='Enter country'
                                                    name='division'
                                                    id='div'
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="district" className='block text-gray-400 text-xs sm:text-sm mb-2'>State/Province</label>
                                            <input
                                                value={state.district}
                                                onChange={inputHandle}
                                                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                type="text"
                                                placeholder='Enter state/province'
                                                name='district'
                                                id='district'
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="sub" className='block text-gray-400 text-xs sm:text-sm mb-2'>Business Address</label>
                                            <input
                                                value={state.sub_district}
                                                onChange={inputHandle}
                                                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                type="text"
                                                placeholder='Enter business address'
                                                name='sub_district'
                                                id='sub'
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="postalCode" className='block text-gray-400 text-xs sm:text-sm mb-2'>Postal Code</label>
                                            <input
                                                value={state.postalCode}
                                                onChange={inputHandle}
                                                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                type="text"
                                                placeholder='Enter postal code'
                                                name='postalCode'
                                                id='postalCode'
                                                required
                                            />
                                        </div>

                                        <div >
                                            <h3 className="text-white font-base text-xs sm:text-sm mb-3 flex items-center">
                                                <BsShieldCheck className="mr-2 text-blue-400" />
                                                Identity Verification
                                            </h3>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={startPersonaVerification}
                                                    className="w-auto bg-indigo-500 text-xs sm:text-sm text-white font-medium rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center"
                                                >
                                                    <BsShieldCheck className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                                                    Verify Identity
                                                </button>

                                                {userInfo?.shopInfo?.documentVerification?.status && (
                                                    <div className="mt-3 p-2 sm:p-3 bg-gradient-to-b from-gray-800/30 to-gray-800/10 rounded-lg border border-gray-600">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-300 text-xs sm:text-sm">Verification Status:</span>
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${userInfo.shopInfo.documentVerification.status === 'verified'
                                                                ? 'bg-green-900/30 text-green-400 border border-green-700'
                                                                : userInfo.shopInfo.documentVerification.status === 'pending'
                                                                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                                                                    : 'bg-red-900/30 text-red-400 border border-red-700'
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


                                    {activeTab === 'registered' && (
                                        <div className='p-3 sm:p-4 md:p-5 bg-gradient-to-b from-gray-800/30 to-gray-800/10 rounded-xl border border-gray-600'>
                                            <h3 className='text-white font-medium mb-3 sm:mb-4 pb-2 border-b border-gray-700 text-sm sm:text-base'>
                                                Business Registration Details
                                            </h3>

                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                                                <div>
                                                    <label htmlFor="cacNumber" className='block text-gray-400 text-xs sm:text-sm mb-2'>CAC Registration Number</label>
                                                    <input
                                                        value={state.cacNumber}
                                                        onChange={inputHandle}
                                                        className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                                        type="text"
                                                        placeholder='Enter CAC number'
                                                        name='cacNumber'
                                                        id='cacNumber'
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="tin" className='block text-gray-400 text-xs sm:text-sm mb-2'>Tax ID (TIN)</label>
                                                    <input
                                                        value={state.tin}
                                                        onChange={inputHandle}
                                                        className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
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

                                    <button
                                        disabled={loader}
                                        className={`w-full bg-white text-indigo-500 font-medium rounded-full px-4 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base`}
                                    >
                                        {loader ? (
                                            <PropagateLoader color='indigo' cssOverride={overrideStyle} size={8} />
                                        ) : 'Save Business Information'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Security */}
                    <div className='w-full lg:w-4/12'>
                        <div className='bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-700'>
                            <h2 className='text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6'>Security Settings</h2>

                            <div className='mb-6 sm:mb-8'>
                                <h3 className='text-white font-medium mb-3 sm:mb-4 pb-2 border-b border-gray-700 text-sm sm:text-base'>Change Password</h3>
                                <form className='space-y-3 sm:space-y-4'>
                                    <div>
                                        <label htmlFor="email" className='block text-gray-400 text-xs sm:text-sm mb-2'>Email Address</label>
                                        <input
                                            className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                            type="email"
                                            placeholder='your@email.com'
                                            name='email'
                                            id='email'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="o_password" className='block text-gray-400 text-xs sm:text-sm mb-2'>Current Password</label>
                                        <input
                                            className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                            type="password"
                                            placeholder='••••••••'
                                            name='old_password'
                                            id='o_password'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="n_password" className='block text-gray-400 text-xs sm:text-sm mb-2'>New Password</label>
                                        <input
                                            className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-white text-sm sm:text-base'
                                            type="password"
                                            placeholder='••••••••'
                                            name='new_password'
                                            id='n_password'
                                        />
                                    </div>
                                    <button className='w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-lg px-4 sm:px-7 py-2.5 sm:py-3.5 hover:from-gray-600 hover:to-gray-700 transition-all text-sm sm:text-base'>
                                        Update Password
                                    </button>
                                </form>
                            </div>

                            {/* <div>
                                <h3 className='text-white font-medium mb-3 sm:mb-4 pb-2 border-b border-gray-700 text-sm sm:text-base'>Two-Factor Authentication</h3>
                                <div className='flex justify-between items-center'>
                                    <div>
                                        <p className='text-gray-400 text-xs sm:text-sm'>Status: <span className='text-orange-500'>Disabled</span></p>
                                        <p className='text-gray-500 text-xs mt-1'>Add an extra layer of security</p>
                                    </div>
                                    <button className='px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-xs sm:text-sm text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all'>
                                        Enable
                                    </button>
                                </div>
                            </div> */}
                        </div>

                        {/* Business Benefits Card */}
                        {/* <div className="mt-4 sm:mt-6 bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-700">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Business Account Benefits</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
                                        <BsPatchCheckFill className="text-indigo-400 text-base sm:text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm sm:text-base">Verified Badge</p>
                                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Build trust with customers</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-green-500/10 p-2 rounded-lg mr-3">
                                        <BsCreditCard className="text-green-400 text-base sm:text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm sm:text-base">Payment Processing</p>
                                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Secure payment collection</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                                        <BsShieldCheck className="text-blue-400 text-base sm:text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm sm:text-base">Enhanced Security</p>
                                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Protect your business data</p>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Payment Account Card */}
                        <div className="mt-4 sm:mt-6 bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-700">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                                <BsCreditCard className="mr-2 text-orange-500" />
                                Payment Account
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm">Account Status</p>
                                        <p className="text-white font-medium text-sm sm:text-base">
                                            {userInfo.payment === 'active' ? 'Active' : 'Not Activated'}
                                        </p>
                                    </div>
                                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${userInfo.payment === 'active'
                                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                                        : 'bg-amber-900/30 text-amber-400 border border-amber-700'
                                        }`}>
                                        {userInfo.payment === 'active' ? 'Verified' : 'Pending'}
                                    </div>
                                </div>

                                {userInfo.payment !== 'active' && (
                                    <button
                                        onClick={activateFlutterwaveAccount}
                                        className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-medium rounded-lg py-2 sm:py-2.5 transition-all shadow-lg shadow-orange-500/20 text-sm sm:text-base"
                                    >
                                        Activate Payment Account
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Details Modal */}
            {showBankForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Add Bank Details</h3>

                        {/* Test Mode Indicator */}
                        {process.env.NODE_ENV !== 'production' && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-700 rounded-xl">
                                <div className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-amber-300 font-medium text-xs sm:text-sm">Test Mode Activated</p>
                                        <p className="text-amber-400 text-xs mt-1">
                                            Use test account numbers: Access Bank - 0690000032, GTBank - 0233333334
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submitBankDetails} className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Account Number</label>
                                <input
                                    type="text"
                                    value={bankDetails.account_number}
                                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-sm sm:text-base"
                                    placeholder="1234567890"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Bank</label>
                                <select
                                    value={bankDetails.bank_code}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bank_code: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none text-sm sm:text-base"
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
                            <div className="flex justify-end space-x-2 sm:space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBankForm(false)}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors text-xs sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sellerReducer.loader}
                                    className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all text-xs sm:text-sm ${sellerReducer.loader ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {sellerReducer.loader ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
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
    );
};

export default Profile;