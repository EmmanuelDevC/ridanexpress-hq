import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import jwt from 'jwt-decode'
import axios from 'axios'
import { api_url } from '../../utils/utils'

export const admin_login = createAsyncThunk(
    'auth/admin_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.post(`${api_url}/api/admin-login`, info)
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_login = createAsyncThunk(
    'auth/seller_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.post(`${api_url}/api/seller-login`, info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
export const logout = createAsyncThunk(
    'auth/logout',
    async ({ navigate, role }, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/logout', { withCredentials: true })
            // localStorage.removeItem('accessToken')
            if (role === 'admin') {
                navigate('/admin/login')
            } else {
                navigate('/login')
            }
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_register = createAsyncThunk(
    'auth/seller_register',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {
        try {
            console.log('Registering seller with:', info); // Debug log
            const { data } = await axios.post(`${api_url}/api/seller-register`, info, {
                withCredentials: true,
                timeout: 30000 // Add timeout
            });

            if (data.token) {
                localStorage.setItem('accessToken', data.token);
            }

            return fulfillWithValue(data);
        } catch (error) {
            console.error('Registration error:', error); // Debug log
            return rejectWithValue(
                error.response?.data || {
                    error: error.message || 'Registration failed. Please try again.'
                }
            );
        }
    }
);

export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async (image, { rejectWithValue, fulfillWithValue, getState }) => {

        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.post(`${api_url}/api/profile-image-upload`, image, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async (formData, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
        try {
            const { data } = await axios.post(`${api_url}/api/profile-info-add`, formData, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_user_info = createAsyncThunk(
    'auth/get_user_info',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/get-user`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

const returnRole = (token) => {
    if (token) {
        const decodeToken = jwt(token)
        const expireTime = new Date(decodeToken.exp * 1000)
        if (new Date() > expireTime) {
            localStorage.removeItem('accessToken')
            return ''
        } else {
            return decodeToken.role
        }
    } else {
        return ''
    }
}


export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: '',
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        logoutUser: (state) => {
            state.token = null;
            state.role = '';
            state.userInfo = '';
            state.successMessage = '';
            state.errorMessage = '';
            localStorage.removeItem('accessToken');
        },
        updateToken: (state, action) => {
            state.token = action.payload;
            localStorage.setItem('accessToken', action.payload);
        },
        updateUserInfo: (state, action) => {
            state.userInfo = action.payload;
        }
    },
    extraReducers: {
        [admin_login.pending]: (state, _) => {
            state.loader = true
        },
        [admin_login.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [admin_login.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.token = payload.token
            state.role = returnRole(payload.token)
            // Add this to update user info immediately
            if (payload.userInfo) {
                state.userInfo = payload.userInfo;
            }
        },
        [seller_login.pending]: (state, _) => {
            state.loader = true
        },
        [seller_login.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [seller_login.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.token = payload.token
            state.role = returnRole(payload.token)
            localStorage.setItem('accessToken', payload.token);
            // Add this to update user info immediately
            if (payload.userInfo) {
                state.userInfo = payload.userInfo;
            }
        },
        
        [seller_register.pending]: (state, _) => {
            state.loader = true;
            state.errorMessage = ''; // Clear previous errors
            state.successMessage = ''; // Clear previous messages
        },
        [seller_register.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || payload?.message || 'Registration failed. Please try again.';
        },
        [seller_register.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
            state.token = payload.token;
            state.role = returnRole(payload.token);

            if (payload.userInfo) {
                state.userInfo = payload.userInfo;
            }
        },

        [get_user_info.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.role = payload.userInfo.role
        },
        [profile_image_upload.pending]: (state, _) => {
            state.loader = true
        },
        [profile_image_upload.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.successMessage = payload.message
        },
        [profile_info_add.pending]: (state, _) => {
            state.loader = true
        },
        [profile_info_add.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.successMessage = payload.message
        },
        [profile_info_add.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Profile update failed';
        }
    }

})
export const {
    messageClear,
    logoutUser,
    updateToken,
    updateUserInfo
} = authReducer.actions
export default authReducer.reducer