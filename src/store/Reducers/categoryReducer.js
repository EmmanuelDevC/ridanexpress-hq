import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'

export const categoryAdd = createAsyncThunk(
    'category/categoryAdd',
    async ({ name, image, subcategories, specificationGroups }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', image);
            formData.append('subcategories', JSON.stringify(subcategories));
            formData.append('specificationGroups', JSON.stringify(specificationGroups));

            const { data } = await axios.post(`${api_url}/api/category-add`, formData, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                error: error.message || 'Category upload failed'
            });
        }
    }
);

export const delete_category = createAsyncThunk(
    'category/delete_category',
    async (categoryId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.delete(`${api_url}/api/category-delete/${categoryId}`,
                { withCredentials: true }
            );
            return fulfillWithValue({ ...data, categoryId });
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                error: error.message || 'Failed to delete category'
            });
        }
    }
);

export const get_category = createAsyncThunk(
    'category/get_category',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/category-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// Update Category
export const update_category = createAsyncThunk(
    'category/update_category',
    async ({ id, name, image, subcategories }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', image);
            formData.append('subcategories', JSON.stringify(subcategories));

            const { data } = await axios.put(`${api_url}/api/category-update/${id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                error: error.message || 'Category update failed'
            });
        }
    }
);


export const categoryReducer = createSlice({
    name: 'category',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        categorys: [],
        totalCategory: 0
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [categoryAdd.pending]: (state, _) => {
            state.loader = true
        },
        [categoryAdd.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [categoryAdd.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.categorys = [...state.categorys, payload.category]
        },
        [get_category.fulfilled]: (state, { payload }) => {
            state.totalCategory = payload.totalCategory
            state.categorys = payload.categorys
        },
    }

})
export const { messageClear } = categoryReducer.actions
export default categoryReducer.reducer