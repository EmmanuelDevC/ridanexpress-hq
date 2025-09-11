import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'

export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async (sellerId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/get-seller/${sellerId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.post(`${api_url}/api/seller-status-update`, info, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_deactive_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/get-deactive-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const create_flutterwave_subaccount = createAsyncThunk(
    'seller/create_flutterwave_subaccount',
    async (bankDetails, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            const { data } = await axios.post(
                `${api_url}/api/create-flutterwave-subaccount`,
                bankDetails,
                config
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Activation failed please try again later' }
            );
        }
    }
);


export const sellerReducer = createSlice({
    name: 'seller',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        sellers: [],
        totalSeller: 0,
        seller: ''
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [get_seller_request.fulfilled]: (state, { payload }) => {
            state.sellers = payload.sellers
            state.totalSeller = payload.totalSeller
        },
        [get_seller.fulfilled]: (state, { payload }) => {
            state.seller = payload.seller
        },
        [seller_status_update.fulfilled]: (state, { payload }) => {
            state.seller = payload.seller
            state.successMessage = payload.message
        },
        [get_active_sellers.fulfilled]: (state, { payload }) => {
            state.sellers = payload.sellers
            state.totalSeller = payload.totalSeller
        },
        [create_flutterwave_subaccount.pending]: (state) => {
            state.loader = true;
        },
        [create_flutterwave_subaccount.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.message || 'Activation failed';
        },
        [create_flutterwave_subaccount.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
        },

    }

})
export const { messageClear } = sellerReducer.actions
export default sellerReducer.reducer