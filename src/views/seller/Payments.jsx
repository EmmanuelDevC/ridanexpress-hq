import React, { forwardRef, useEffect, useState } from 'react';
import { BsCurrencyDollar, BsClockHistory, BsCheckCircle, BsArrowRepeat } from 'react-icons/bs';
import { FiSend, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FixedSizeList as List } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import {
    get_seller_payemt_details,
    send_withdrowal_request,
    messageClear
} from '../../store/Reducers/PaymentReducer';

function handleOnWheel({ deltaY }) {
    console.log('handleOnWheel', deltaY);
}

const outerElementType = forwardRef((props, ref) => (
    <div ref={ref} onWheel={handleOnWheel} {...props} />
));

const Payments = () => {
    const [amount, setAmount] = useState(0);
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const {
        successMessage,
        errorMessage,
        loader,
        pendingWithdrows,
        successWithdrows,
        totalAmount,
        withdrowAmount,
        pendingAmount,
        availableAmount
    } = useSelector(state => state.payment);

    // Format currency as Naira
    const formatCurrency = (value) => {
        return `₦${parseFloat(value).toLocaleString('en-NG')}`;
    };

    const Row = ({ index, style }) => {
        return (
            <div style={style} className='flex text-sm border-b border-gray-700 hover:bg-gray-800 transition-colors'>
                <div className='w-[25%] p-3 text-gray-300'>{index + 1}</div>
                <div className='w-[25%] p-3 text-green-400 font-medium'>
                    {formatCurrency(pendingWithdrows[index]?.amount)}
                </div>
                <div className='w-[25%] p-3'>
                    <span className='py-1 px-2 bg-yellow-500/20 text-yellow-400 rounded-md text-xs font-medium flex items-center'>
                        <BsClockHistory className="mr-1" /> {pendingWithdrows[index]?.status}
                    </span>
                </div>
                <div className='w-[25%] p-3 text-gray-400 text-sm'>{moment(pendingWithdrows[index]?.createdAt).format('MMM D, YYYY')}</div>
            </div>
        );
    };

    const Rows = ({ index, style }) => {
        return (
            <div style={style} className='flex text-sm border-b border-gray-700 hover:bg-gray-800 transition-colors'>
                <div className='w-[25%] p-3 text-gray-300'>{index + 1}</div>
                <div className='w-[25%] p-3 text-green-400 font-medium'>
                    {formatCurrency(successWithdrows[index]?.amount)}
                </div>
                <div className='w-[25%] p-3'>
                    <span className='py-1 px-2 bg-green-500/20 text-green-400 rounded-md text-xs font-medium flex items-center'>
                        <BsCheckCircle className="mr-1" /> {successWithdrows[index]?.status}
                    </span>
                </div>
                <div className='w-[25%] p-3 text-gray-400 text-sm'>{moment(successWithdrows[index]?.createdAt).format('MMM D, YYYY')}</div>
            </div>
        );
    };

    useEffect(() => {
        dispatch(get_seller_payemt_details(userInfo._id));
    }, []);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [errorMessage, successMessage]);

    const sendRequest = (e) => {
        e.preventDefault();
        const MIN_WITHDRAWAL = 100;

        // Convert to integer and validate
        const intAmount = Math.floor(Number(amount));

        if (isNaN(intAmount) || intAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (intAmount < MIN_WITHDRAWAL) {
            toast.error(`Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}`);
            return;
        }

        if (intAmount > availableAmount) {
            toast.error(`Amount exceeds available balance of ${formatCurrency(availableAmount)}`);
            return;
        }

        dispatch(send_withdrowal_request({
            amount: intAmount,
            sellerId: userInfo._id
        }));
        setAmount(0);
    };

    return (
        <div className='px-2 sm:px-4 md:px-6 py-4 bg-gray-900 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center'>
                        <FiCreditCard className='mr-2 sm:mr-3 text-indigo-400 text-lg sm:text-xl' />
                        Payment Dashboard
                    </h1>
                    <p className='text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base'>
                        Manage your earnings and withdrawal requests
                    </p>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
                    <div className='bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 border border-gray-700 shadow-lg'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-400 text-xs sm:text-sm font-medium mb-1'>Total Sales</h3>
                                <p className='text-lg sm:text-xl md:text-2xl font-bold text-white'>{formatCurrency(totalAmount)}</p>
                            </div>
                            <div className='bg-indigo-500/10 p-2 sm:p-3 rounded-lg'>
                                <BsCurrencyDollar className='text-indigo-400 text-lg sm:text-xl' />
                            </div>
                        </div>
                        <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700'>
                            <p className='text-xs text-gray-400'>All-time earnings</p>
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 border border-gray-700 shadow-lg'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-400 text-xs sm:text-sm font-medium mb-1'>Available Amount</h3>
                                <p className='text-lg sm:text-xl md:text-2xl font-bold text-white'>{formatCurrency(availableAmount)}</p>
                            </div>
                            <div className='bg-green-500/10 p-2 sm:p-3 rounded-lg'>
                                <BsCurrencyDollar className='text-green-400 text-lg sm:text-xl' />
                            </div>
                        </div>
                        <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700'>
                            <p className='text-xs text-gray-400'>Ready for withdrawal</p>
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 border border-gray-700 shadow-lg'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-400 text-xs sm:text-sm font-medium mb-1'>Withdrawn</h3>
                                <p className='text-lg sm:text-xl md:text-2xl font-bold text-white'>{formatCurrency(withdrowAmount)}</p>
                            </div>
                            <div className='bg-blue-500/10 p-2 sm:p-3 rounded-lg'>
                                <BsCurrencyDollar className='text-blue-400 text-lg sm:text-xl' />
                            </div>
                        </div>
                        <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700'>
                            <p className='text-xs text-gray-400'>Total funds transferred</p>
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 border border-gray-700 shadow-lg'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-400 text-xs sm:text-sm font-medium mb-1'>Pending</h3>
                                <p className='text-lg sm:text-xl md:text-2xl font-bold text-white'>{formatCurrency(pendingAmount)}</p>
                            </div>
                            <div className='bg-yellow-500/10 p-2 sm:p-3 rounded-lg'>
                                <BsCurrencyDollar className='text-yellow-400 text-lg sm:text-xl' />
                            </div>
                        </div>
                        <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700'>
                            <p className='text-xs text-gray-400'>Awaiting processing</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                    {/* Left Column - Withdrawal Form */}
                    <div className='bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-lg'>
                        <div className='mb-4 sm:mb-6'>
                            <h2 className='text-lg sm:text-xl font-semibold text-white flex items-center'>
                                <FiSend className='mr-2 text-indigo-400' />
                                Withdrawal Request
                            </h2>
                            <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                                Transfer funds to your bank account
                            </p>
                        </div>

                        <form onSubmit={sendRequest} className='space-y-4 sm:space-y-6'>
                            <div>
                                <label className='block text-gray-300 text-xs sm:text-sm font-medium mb-2'>
                                    Amount (Available: <span className='text-green-400'>{formatCurrency(availableAmount)}</span>)
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <span className='text-gray-400'>₦</span>
                                    </div>
                                    <input
                                        onChange={(e) => setAmount(e.target.value)}
                                        value={amount}
                                        min="1000"
                                        step="1"
                                        type="number"
                                        className='w-full pl-8 pr-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition text-white placeholder-gray-500 text-sm sm:text-base'
                                        placeholder='Enter amount'
                                        required
                                    />
                                </div>
                                <p className='text-xs text-gray-500 mt-2'>
                                    Minimum withdrawal: ₦100. Processing time: 24hrs
                                </p>
                            </div>

                            <button
                                disabled={loader}
                                className={`w-full flex justify-center items-center py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base ${loader ? 'opacity-80' : ''
                                    }`}
                            >
                                {loader ? (
                                    <>
                                        <BsArrowRepeat className="animate-spin mr-2 text-sm" />
                                        Processing...
                                    </>
                                ) : (
                                    'Request Withdrawal'
                                )}
                            </button>
                        </form>

                        <div className='mt-6 sm:mt-8'>
                            <div className='flex justify-between items-center mb-3 sm:mb-4'>
                                <h3 className='text-base sm:text-lg font-semibold text-white flex items-center'>
                                    <BsClockHistory className='mr-2 text-yellow-400 text-sm sm:text-base' />
                                    Pending Requests
                                </h3>
                                <span className='bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full'>
                                    {pendingWithdrows.length} requests
                                </span>
                            </div>

                            <div className='bg-gray-800 rounded-lg border border-gray-700 overflow-hidden'>
                                <div className='hidden sm:flex bg-gray-700 text-gray-300 text-xs sm:text-sm font-medium'>
                                    <div className='w-[25%] p-2 sm:p-3'>ID</div>
                                    <div className='w-[25%] p-2 sm:p-3'>Amount</div>
                                    <div className='w-[25%] p-2 sm:p-3'>Status</div>
                                    <div className='w-[25%] p-2 sm:p-3'>Date</div>
                                </div>
                                <div className='max-h-[300px] sm:max-h-[350px] overflow-y-auto'>
                                    <List
                                        height={300}
                                        itemCount={pendingWithdrows.length}
                                        itemSize={50}
                                        width="100%"
                                        outerElementType={outerElementType}
                                    >
                                        {Row}
                                    </List>
                                </div>

                                {pendingWithdrows.length === 0 && (
                                    <div className='text-center py-6 sm:py-8 text-gray-500 text-sm'>
                                        No pending withdrawal requests
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Completed Withdrawals */}
                    <div className='bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-lg'>
                        <div className='flex justify-between items-center mb-3 sm:mb-4'>
                            <h3 className='text-base sm:text-lg font-semibold text-white flex items-center'>
                                <BsCheckCircle className='mr-2 text-green-400 text-sm sm:text-base' />
                                Completed Withdrawals
                            </h3>
                            <span className='bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full'>
                                {successWithdrows.length} transactions
                            </span>
                        </div>

                        <div className='bg-gray-800 rounded-lg border border-gray-700 overflow-hidden'>
                            <div className='hidden sm:flex bg-gray-700 text-gray-300 text-xs sm:text-sm font-medium'>
                                <div className='w-[25%] p-2 sm:p-3'>ID</div>
                                <div className='w-[25%] p-2 sm:p-3'>Amount</div>
                                <div className='w-[25%] p-2 sm:p-3'>Status</div>
                                <div className='w-[25%] p-2 sm:p-3'>Date</div>
                            </div>
                            <div className='max-h-[300px] sm:max-h-[350px] overflow-y-auto'>
                                <List
                                    height={300}
                                    itemCount={successWithdrows.length}
                                    itemSize={50}
                                    width="100%"
                                    outerElementType={outerElementType}
                                >
                                    {Rows}
                                </List>
                            </div>

                            {successWithdrows.length === 0 && (
                                <div className='text-center py-6 sm:py-8 text-gray-500 text-sm'>
                                    No completed withdrawals yet
                                </div>
                            )}
                        </div>

                        <div className='mt-6 sm:mt-8 bg-indigo-900/20 border border-indigo-800 rounded-xl p-3 sm:p-4'>
                            <h4 className='text-indigo-300 font-medium flex items-center mb-2 text-sm sm:text-base'>
                                <FiCreditCard className='mr-2 text-sm' />
                                Payment Information
                            </h4>
                            <p className='text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3'>
                                Funds are transferred to your bank account via secure payment processing.
                            </p>
                            <ul className='text-gray-400 text-xs sm:text-sm space-y-1'>
                                <li className='flex items-start'>
                                    <span className='text-green-400 mr-2'>•</span>
                                    Transfers take 1-3 business days
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-green-400 mr-2'>•</span>
                                    Minimum withdrawal amount: ₦100
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-green-400 mr-2'>•</span>
                                    No transaction fees
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;