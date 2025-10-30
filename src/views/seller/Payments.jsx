import React, { forwardRef, useEffect, useState } from 'react';
import { 
    BsCurrencyDollar, 
    BsClockHistory, 
    BsCheckCircle, 
    BsArrowRepeat,
    BsBank,
    BsWallet2,
    BsCashCoin,
    BsHourglassSplit
} from 'react-icons/bs';
import { 
    FiSend, 
    FiCreditCard, 
    FiDollarSign,
    FiTrendingUp,
    FiShield,
    FiCalendar
} from 'react-icons/fi';
import { 
    FaRegCheckCircle,
    FaMoneyBillWave,
    FaPiggyBank
} from 'react-icons/fa';
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
            <div style={style} className='flex text-sm border-b border-blue-100 hover:bg-blue-50 transition-colors'>
                <div className='w-[25%] p-3 text-gray-700 font-medium'>{index + 1}</div>
                <div className='w-[25%] p-3 text-green-600 font-semibold'>
                    {formatCurrency(pendingWithdrows[index]?.amount)}
                </div>
                <div className='w-[25%] p-3'>
                    <span className='py-1 px-3 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center w-fit'>
                        <BsClockHistory className="mr-1 text-yellow-600" /> {pendingWithdrows[index]?.status}
                    </span>
                </div>
                <div className='w-[25%] p-3 text-gray-600 text-sm flex items-center'>
                    <FiCalendar className="mr-2 text-gray-400" />
                    {moment(pendingWithdrows[index]?.createdAt).format('MMM D, YYYY')}
                </div>
            </div>
        );
    };

    const Rows = ({ index, style }) => {
        return (
            <div style={style} className='flex text-sm border-b border-blue-100 hover:bg-blue-50 transition-colors'>
                <div className='w-[25%] p-3 text-gray-700 font-medium'>{index + 1}</div>
                <div className='w-[25%] p-3 text-green-600 font-semibold'>
                    {formatCurrency(successWithdrows[index]?.amount)}
                </div>
                <div className='w-[25%] p-3'>
                    <span className='py-1 px-3 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center w-fit'>
                        <BsCheckCircle className="mr-1 text-green-600" /> {successWithdrows[index]?.status}
                    </span>
                </div>
                <div className='w-[25%] p-3 text-gray-600 text-sm flex items-center'>
                    <FiCalendar className="mr-2 text-gray-400" />
                    {moment(successWithdrows[index]?.createdAt).format('MMM D, YYYY')}
                </div>
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
        <div className='px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                <div className='mb-8'>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                            <FiCreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                                Payment Dashboard
                            </h1>
                            <p className='text-gray-600 mt-1 text-sm sm:text-base'>
                                Manage your earnings and withdrawal requests
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
                    <div className='bg-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-600 text-sm font-medium mb-1 flex items-center'>
                                    <FiTrendingUp className="mr-2 text-blue-500" />
                                    Total Sales
                                </h3>
                                <p className='text-xl font-bold text-gray-900'>{formatCurrency(totalAmount)}</p>
                            </div>
                            <div className='bg-blue-50 p-3 rounded-lg'>
                                <BsCurrencyDollar className='text-blue-600 text-lg' />
                            </div>
                        </div>
                        <div className='mt-4 pt-4 border-t border-blue-50'>
                            <p className='text-xs text-gray-500'>All-time earnings from sales</p>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-600 text-sm font-medium mb-1 flex items-center'>
                                    <BsWallet2 className="mr-2 text-green-500" />
                                    Available Amount
                                </h3>
                                <p className='text-xl font-bold text-gray-900'>{formatCurrency(availableAmount)}</p>
                            </div>
                            <div className='bg-green-50 p-3 rounded-lg'>
                                <FaMoneyBillWave className='text-green-600 text-lg' />
                            </div>
                        </div>
                        <div className='mt-4 pt-4 border-t border-green-50'>
                            <p className='text-xs text-gray-500'>Ready for withdrawal</p>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-600 text-sm font-medium mb-1 flex items-center'>
                                    <FiDollarSign className="mr-2 text-purple-500" />
                                    Withdrawn
                                </h3>
                                <p className='text-xl font-bold text-gray-900'>{formatCurrency(withdrowAmount)}</p>
                            </div>
                            <div className='bg-purple-50 p-3 rounded-lg'>
                                <BsCashCoin className='text-purple-600 text-lg' />
                            </div>
                        </div>
                        <div className='mt-4 pt-4 border-t border-purple-50'>
                            <p className='text-xs text-gray-500'>Total funds transferred</p>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-5 border border-yellow-100 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-gray-600 text-sm font-medium mb-1 flex items-center'>
                                    <BsHourglassSplit className="mr-2 text-yellow-500" />
                                    Pending
                                </h3>
                                <p className='text-xl font-bold text-gray-900'>{formatCurrency(pendingAmount)}</p>
                            </div>
                            <div className='bg-yellow-50 p-3 rounded-lg'>
                                <FaPiggyBank className='text-yellow-600 text-lg' />
                            </div>
                        </div>
                        <div className='mt-4 pt-4 border-t border-yellow-50'>
                            <p className='text-xs text-gray-500'>Awaiting processing</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8'>
                    {/* Left Column - Withdrawal Form */}
                    <div className='bg-white rounded-xl p-5 sm:p-6 border border-blue-100 shadow-sm'>
                        <div className='mb-6'>
                            <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                                <FiSend className='mr-3 text-blue-600 p-2 bg-blue-50 rounded-lg' />
                                Withdrawal Request
                            </h2>
                            <p className='text-gray-600 text-sm mt-2'>
                                Transfer funds to your bank account securely
                            </p>
                        </div>

                        <form onSubmit={sendRequest} className='space-y-6'>
                            <div>
                                <label className='block text-gray-700 text-sm font-medium mb-3'>
                                    <div className="flex items-center justify-between">
                                        <span>Withdrawal Amount</span>
                                        <span className='text-green-600 font-semibold text-sm'>
                                            Available: {formatCurrency(availableAmount)}
                                        </span>
                                    </div>
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <span className='text-gray-500 text-lg font-medium'>₦</span>
                                    </div>
                                    <input
                                        onChange={(e) => setAmount(e.target.value)}
                                        value={amount}
                                        min="100"
                                        step="1"
                                        type="number"
                                        className='w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition text-gray-900 placeholder-gray-500 text-base font-medium'
                                        placeholder='Enter amount'
                                        required
                                    />
                                </div>
                                <p className='text-xs text-gray-500 mt-3 flex items-center'>
                                    <FiShield className="mr-1 text-green-500" />
                                    Minimum withdrawal: ₦100 • Processing time: 24-48 hours
                                </p>
                            </div>

                            <button
                                disabled={loader}
                                className={`w-full flex justify-center items-center py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-semibold hover:shadow-lg transition-all text-sm ${loader ? 'opacity-80 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800'
                                    }`}
                            >
                                {loader ? (
                                    <>
                                        <BsArrowRepeat className="animate-spin mr-2 text-base" />
                                        Processing Request...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="mr-2 text-base" />
                                        Request Withdrawal
                                    </>
                                )}
                            </button>
                        </form>

                        <div className='mt-8'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                                    <BsClockHistory className='mr-3 text-yellow-600 p-2 bg-yellow-50 rounded-lg' />
                                    Pending Requests
                                </h3>
                                <span className='bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full'>
                                    {pendingWithdrows.length} requests
                                </span>
                            </div>

                            <div className='bg-gray-50 rounded-lg border border-gray-200 overflow-hidden'>
                                <div className='hidden sm:flex bg-white text-gray-700 text-sm font-medium border-b border-gray-200'>
                                    <div className='w-[25%] p-3 font-semibold'>ID</div>
                                    <div className='w-[25%] p-3 font-semibold'>Amount</div>
                                    <div className='w-[25%] p-3 font-semibold'>Status</div>
                                    <div className='w-[25%] p-3 font-semibold'>Date</div>
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
                                    <div className='text-center py-8 text-gray-500 text-sm'>
                                        <BsClockHistory className='mx-auto text-2xl text-gray-400 mb-2' />
                                        No pending withdrawal requests
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Completed Withdrawals */}
                    <div className='bg-white rounded-xl p-5 sm:p-6 border border-blue-100 shadow-sm'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                                <BsCheckCircle className='mr-3 text-green-600 p-2 bg-green-50 rounded-lg' />
                                Completed Withdrawals
                            </h3>
                            <span className='bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full'>
                                {successWithdrows.length} transactions
                            </span>
                        </div>

                        <div className='bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6'>
                            <div className='hidden sm:flex bg-white text-gray-700 text-sm font-medium border-b border-gray-200'>
                                <div className='w-[25%] p-3 font-semibold'>ID</div>
                                <div className='w-[25%] p-3 font-semibold'>Amount</div>
                                <div className='w-[25%] p-3 font-semibold'>Status</div>
                                <div className='w-[25%] p-3 font-semibold'>Date</div>
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
                                <div className='text-center py-8 text-gray-500 text-sm'>
                                    <BsCheckCircle className='mx-auto text-2xl text-gray-400 mb-2' />
                                    No completed withdrawals yet
                                </div>
                            )}
                        </div>

                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4'>
                            <h4 className='text-blue-800 font-semibold flex items-center mb-3 text-sm'>
                                <BsBank className='mr-2 text-blue-600' />
                                Payment Information
                            </h4>
                            <p className='text-gray-700 text-sm mb-3'>
                                Your funds are securely transferred to your registered bank account through our encrypted payment gateway.
                            </p>
                            <ul className='text-gray-600 text-sm space-y-2'>
                                <li className='flex items-start'>
                                    <FaRegCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                                    Transfers typically complete within 1-3 business days
                                </li>
                                <li className='flex items-start'>
                                    <FaRegCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                                    Minimum withdrawal amount: ₦100
                                </li>
                                <li className='flex items-start'>
                                    <FaRegCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                                    Zero transaction fees for all withdrawals
                                </li>
                                <li className='flex items-start'>
                                    <FaRegCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                                    256-bit SSL encryption for all transactions
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