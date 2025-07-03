import React, { forwardRef, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FiCheckCircle } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { 
  get_payment_request, 
  confirm_payment_request,
  messageClear 
} from '../../store/Reducers/PaymentReducer';

function handleOnWheel({ deltaY }) {
  console.log('handleOnWheel', deltaY);
}

const outerElementType = forwardRef((props, ref) => (
  <div ref={ref} onWheel={handleOnWheel} {...props} />
));

const PaymentRequest = () => {
  const dispatch = useDispatch();
  const { successMessage, errorMessage, loader, pendingWithdrows } = useSelector(state => state.payment);
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    dispatch(get_payment_request());
  }, []);

  const confirm_request = (id) => {
    setPaymentId(id);
    dispatch(confirm_payment_request(id));
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
  }, [errorMessage, successMessage]);

  const Row = ({ index, style }) => {
    const payment = pendingWithdrows[index];
    const isProcessing = loader && paymentId === payment._id;
    
    return (
      <div 
        style={style} 
        className='flex text-sm items-center border-b border-gray-700 hover:bg-gray-800 transition-colors'
      >
        <div className='w-[15%] p-3 text-gray-300'>{index + 1}</div>
        <div className='w-[20%] p-3'>
          <div className='text-green-400 font-medium'>₦{payment.amount.toLocaleString('en-NG')}</div>
        </div>
        <div className='w-[20%] p-3'>
          <span className='py-1 px-2 bg-yellow-500/20 text-yellow-400 rounded-md text-xs font-medium'>
            {payment.status}
          </span>
        </div>
        <div className='w-[25%] p-3 text-gray-400 text-sm'>
          {moment(payment.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
        <div className='w-[20%] p-3'>
          <button 
            disabled={isProcessing}
            onClick={() => confirm_request(payment._id)}
            className={`flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium ${
              isProcessing 
                ? 'bg-gray-600 text-gray-400' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FiCheckCircle className="mr-2" />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='px-4 lg:px-8 pt-5 bg-gray-900 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-white flex items-center'>
            Payment Requests
            <span className='ml-3 bg-blue-500 text-white text-sm px-2.5 py-1 rounded-full'>
              {pendingWithdrows.length} pending
            </span>
          </h1>
          <p className='text-gray-400 mt-2'>
            Review and confirm seller withdrawal requests
          </p>
        </div>
        
        <div className='bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden'>
          <div className='bg-gray-700 text-gray-300 text-sm font-medium'>
            <div className='flex'>
              <div className='w-[15%] p-3'>#</div>
              <div className='w-[20%] p-3'>Amount (₦)</div>
              <div className='w-[20%] p-3'>Status</div>
              <div className='w-[25%] p-3'>Date</div>
              <div className='w-[20%] p-3'>Action</div>
            </div>
          </div>
          
          <div className='max-h-[500px] overflow-y-auto'>
            {pendingWithdrows.length > 0 ? (
              <List
                height={500}
                itemCount={pendingWithdrows.length}
                itemSize={70}
                width="100%"
                outerElementType={outerElementType}
              >
                {Row}
              </List>
            ) : (
              <div className='text-center py-10 text-gray-500'>
                <div className='mb-2'>No pending withdrawal requests</div>
                <div className='text-sm text-gray-600'>All requests have been processed</div>
              </div>
            )}
          </div>
          
          <div className='p-4 bg-gray-750 border-t border-gray-700'>
            <div className='text-sm text-gray-400'>
              <span className='font-medium'>Note:</span> Payments are processed via Flutterwave and 
              transferred directly to sellers' bank accounts in NGN.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest;